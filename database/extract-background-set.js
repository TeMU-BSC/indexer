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
 */


// connection to required databases
var bvsalud = db.getSiblingDB('BvSalud')
var datasets = db.getSiblingDB('datasets')

// articles with its abstract in spanish (es)
var es_ids = bvsalud.abstract_es.distinct('_id')
bvsalud.all_articles.aggregate([
    { $match: { '_id': { $in: es_ids } } },
    { $out: 'articles_es' }
])

// candidates for the background set
bvsalud.articles_es.aggregate([
    { $merge: { into: { db: "test", coll: "candidates" } } }
])
datasets.isciii.aggregate([
    { $merge: { into: { db: "test", coll: "candidates" } } }
])
datasets.reec.aggregate([
    { $merge: { into: { db: "test", coll: "candidates" } } }
])

// previous development and test sets excluded from the background set
bvsalud.developmentSetUnion.aggregate([
    { $merge: { into: { db: "test", coll: "excluded" } } }
])
bvsalud.testSet.aggregate([
    { $merge: { into: { db: "test", coll: "excluded" } } }
])

// background set (with heterogeneous fields)
var excluded_abstracts = bvsalud.excluded.distinct('abstractText')
bvsalud.candidates.aggregate([
    { $match: { 'ab_es': { $nin: excluded_abstracts } } },
    { $out: 'background_set' }
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

// remove temporary collections
bvsalud.candidates.drop()
bvsalud.excluded.drop()
