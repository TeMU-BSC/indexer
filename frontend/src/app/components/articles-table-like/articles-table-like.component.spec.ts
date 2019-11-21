import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesTableLikeComponent } from './articles-table-like.component';

describe('ArticlesTableLikeComponent', () => {
  let component: ArticlesTableLikeComponent;
  let fixture: ComponentFixture<ArticlesTableLikeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticlesTableLikeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticlesTableLikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
