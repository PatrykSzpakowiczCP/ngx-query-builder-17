import {AfterViewInit, computed, Directive, model, TemplateRef} from '@angular/core';

@Directive({selector: '[queryInput]', standalone: false})
export class QueryInputDirective implements AfterViewInit {
  static defaultType = 'to-be-set';
  queryInputType = model<string>(QueryInputDirective.defaultType)
  isInitialised = computed(() => this.queryInputType() !== QueryInputDirective.defaultType);

  constructor(public template: TemplateRef<any>) {}

  ngAfterViewInit(): void {
    if (!this.isInitialised())
      throw new Error('No input type provided for QueryInputDirective');
  }

}
