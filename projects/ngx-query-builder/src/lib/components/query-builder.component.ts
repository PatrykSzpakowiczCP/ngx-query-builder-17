import {ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator} from '@angular/forms';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component, computed,
  contentChild,
  contentChildren,
  forwardRef, signal
} from '@angular/core';
import {BaseQueryBuilder} from "./base-query-builder";
import {QueryButtonGroupDirective} from "../directives/query-button-group.directive";
import {QuerySwitchGroupDirective} from "../directives/query-switch-group.directive";
import {QueryFieldDirective} from "../directives/query-field.directive";
import {QueryEntityDirective} from "../directives/query-entity.directive";
import {QueryOperatorDirective} from "../directives/query-operator.directive";
import {QueryRulesetAddRuleButtonDirective} from "../directives/query-ruleset-add-rule-button.directive";
import {QueryRulesetAddRulesetButtonDirective} from "../directives/query-ruleset-add-ruleset-button.directive";
import {QueryRulesetRemoveButtonDirective} from "../directives/query-ruleset-remove-button.directive";
import {QueryRuleRemoveButtonDirective} from "../directives/query-rule-remove-button.directive";
import {QueryEmptyWarningDirective} from "../directives/query-empty-warning.directive";
import {QueryArrowIconDirective} from "../directives/query-arrow-icon.directive";
import {QueryInputDirective} from "../directives/query-input.directive";

export const CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => QueryBuilderComponent),
  multi: true
};

export const VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => QueryBuilderComponent),
  multi: true
};

@Component({
  selector: 'ngx-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css'],
  providers: [CONTROL_VALUE_ACCESSOR, VALIDATOR],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryBuilderComponent extends BaseQueryBuilder implements ControlValueAccessor, Validator, AfterContentInit {
  isRoot = () => true
  // Dumb value for the root
  parentValue = signal(undefined);
  index = signal<number>(0);

  onChangeCallback = signal<(() => void) | undefined>(undefined);
  onTouchedCallback = signal<(() => any) | undefined>(undefined);

  // Templates from Content
  buttonGroupTemplate = contentChild(QueryButtonGroupDirective);
  switchGroupTemplate = contentChild(QuerySwitchGroupDirective);
  fieldTemplate = contentChild(QueryFieldDirective);
  entityTemplate = contentChild(QueryEntityDirective);
  operatorTemplate = contentChild(QueryOperatorDirective);
  rulesetAddRuleButtonTemplate = contentChild(QueryRulesetAddRuleButtonDirective);
  rulesetAddRulesetButtonTemplate = contentChild(QueryRulesetAddRulesetButtonDirective);
  rulesetRemoveButtonTemplate = contentChild(QueryRulesetRemoveButtonDirective);
  ruleRemoveButtonTemplate = contentChild(QueryRuleRemoveButtonDirective);
  emptyWarningTemplate = contentChild(QueryEmptyWarningDirective);
  arrowIconTemplate = contentChild(QueryArrowIconDirective);
  inputTemplates = contentChildren(QueryInputDirective)

  override readonly inputTypeToTemplate = computed(() => {
    return new Map(this.inputTemplates().map(input => [input.queryInputType(), input]))
  });

}
