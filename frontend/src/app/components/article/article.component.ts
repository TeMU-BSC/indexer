import { Component, Input } from '@angular/core'
import { Article, Descriptor } from 'src/app/app.model'

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent {

  @Input() article: Article
  descriptorToAdd: Descriptor
  descriptorToRemove: Descriptor

  getDescriptorToAdd(descriptor: Descriptor) {
    this.descriptorToAdd = descriptor
    console.log('To Add: ', this.descriptorToAdd)
  }

  getDescriptorToRemove(descriptor: Descriptor) {
    this.descriptorToRemove = descriptor
    console.log('To Remove: ', this.descriptorToRemove)
  }

}
