import { Component, Input } from '@angular/core'
import { Article, Descriptor } from 'src/app/app.model'

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent {

  @Input() article: Article
  receivedDescriptor: Descriptor

  getDescriptor(descriptor: Descriptor) {
    this.receivedDescriptor = descriptor
    console.log(this.receivedDescriptor)

  }

}
