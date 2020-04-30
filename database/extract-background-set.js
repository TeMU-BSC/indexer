/*
 * Author: Alejandro Asensio <alejandro.asensio@bsc.es>
 * Created at: 2020-04-30 17:30
 * 
 * Description: This script extracts the background set from the MongoDB for
 * the MESINESP task.
 * 
 * Usage:
 * 
 * First, if you are not at the BSC office, connect through VPN to BSC:
 * $ sudo openfortivpn gw.bsc.es:443 -u USERNAME
 * 
 * Then, execute the JavaScript file with the mongo shell:
 * $ mongo <thisfilename>.js
 * 
 * GOTCHA: This script contains some syntax compatible with mongo version 4.2 onwards, such as $merge.
 * This script was run in localhost mongo version 4.2 like so:
 * $ mongo extract-background-set.js
 * 
 * And then uploaded to production mongo version 4.0 like so:
 * $ mongodump --archive --db=BvSalud --collection=articles_es | mongorestore --host bsccnio01.bsc.es --archive --db=BvSalud --collection=articles_es
 * $ mongodump --archive --db=BvSalud --collection=background_set | mongorestore --host bsccnio01.bsc.es --archive --db=BvSalud --collection=background_set
 * $ mongodump --archive --db=BvSalud --collection=background_subset_2019 | mongorestore --host bsccnio01.bsc.es --archive --db=BvSalud --collection=background_subset_2019
 */


// connection to required databases
var bvsalud = db.getSiblingDB('BvSalud')
var datasets = db.getSiblingDB('datasets')

// create a temporary database
var tmp = db.getSiblingDB('tmp')

// articles with its abstract in spanish (es)
var es_ids = bvsalud.abstract_es.distinct('_id')
bvsalud.all_articles.aggregate([
    { $match: { '_id': { $in: es_ids } } },
    { $out: 'articles_es' }
])

// candidates for the background set
bvsalud.articles_es.aggregate([
    { $merge: { into: { db: 'tmp', coll: 'candidates' } } }
])
datasets.isciii.aggregate([
    { $merge: { into: { db: 'tmp', coll: 'candidates' } } }
])
datasets.reec.aggregate([
    { $merge: { into: { db: 'tmp', coll: 'candidates' } } }
])

// previous development and test sets excluded from the background set
bvsalud.development_set_union.aggregate([
    { $merge: { into: { db: 'tmp', coll: 'excluded' } } }
])
bvsalud.test_set_without_codes.aggregate([
    { $merge: { into: { db: 'tmp', coll: 'excluded' } } }
])

// background set (with heterogeneous fields)
var excluded_abstracts = tmp.excluded.distinct('abstractText')
tmp.candidates.aggregate([
    { $match: { 'ab_es': { $nin: excluded_abstracts } } },
    { $merge: { into: { db: 'BvSalud', coll: 'background_set' } } }
])

// background set (with well defined and homogeneous fields)
bvsalud.background_set.aggregate([
    {
        $set: {
            id: '$_id',
            title: '$ti_es',
            abstractText: '$ab_es',
            journal: { $arrayElemAt: ['$ta', 0] },
            db: '$db',
            year: { $year: '$entry_date' },
            decsCodes: []
        }
    },
    {
        $project: {
            id: 1,
            title: 1,
            abstractText: 1,
            journal: 1,
            db: 1,
            year: 1,
            decsCodes: 1
        }
    },
    { $out: 'background_set' }
])

// background subset (publications from 2019 onwards)
bvsalud.background_set.aggregate([
    { $match: { 'year': { $gte: 2019 } } },
    { $out: 'background_subset_2019' }
])

// remove the temporary database
tmp.dropDatabase()
