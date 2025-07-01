import {AfterContentInit, ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {QueryArrowIconDirective} from "../directives/query-arrow-icon.directive";
import {QueryInputDirective} from "../directives/query-input.directive";
import {QueryOperatorDirective} from "../directives/query-operator.directive";
import {QueryFieldDirective} from "../directives/query-field.directive";
import {QueryEntityDirective} from "../directives/query-entity.directive";
import {QuerySwitchGroupDirective} from "../directives/query-switch-group.directive";
import {QueryButtonGroupDirective} from "../directives/query-button-group.directive";
import {QueryRulesetAddRuleButtonDirective} from "../directives/query-ruleset-add-rule-button.directive";
import {QueryRulesetAddRulesetButtonDirective} from "../directives/query-ruleset-add-ruleset-button.directive";
import {QueryRulesetRemoveButtonDirective} from "../directives/query-ruleset-remove-button.directive";
import {QueryRuleRemoveButtonDirective} from "../directives/query-rule-remove-button.directive";
import {QueryEmptyWarningDirective} from "../directives/query-empty-warning.directive";
import {RuleSet} from "../models/query-builder.interfaces";
import {BaseQueryBuilder} from "./base-query-builder";
import {ControlValueAccessor, Validator} from "@angular/forms";

@Component({
  selector: 'inner-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrl: './query-builder.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InnerQueryBuilderComponent extends BaseQueryBuilder implements ControlValueAccessor, Validator, AfterContentInit {
  override isRoot = () => false
  override index = input.required<number>();
  override parentValue = model.required<RuleSet>();

  override buttonGroupTemplate = input<QueryButtonGroupDirective>()
  override switchGroupTemplate = input<QuerySwitchGroupDirective>();
  override fieldTemplate = input<QueryFieldDirective>();
  override entityTemplate = input<QueryEntityDirective>();
  override operatorTemplate = input<QueryOperatorDirective>();
  override rulesetAddRuleButtonTemplate = input<QueryRulesetAddRuleButtonDirective>();
  override rulesetAddRulesetButtonTemplate = input<QueryRulesetAddRulesetButtonDirective>();
  override rulesetRemoveButtonTemplate = input<QueryRulesetRemoveButtonDirective>();
  override ruleRemoveButtonTemplate = input<QueryRuleRemoveButtonDirective>();
  override emptyWarningTemplate = input<QueryEmptyWarningDirective>();
  override arrowIconTemplate = input<QueryArrowIconDirective>();
  override inputTypeToTemplate = input.required<Map<string, QueryInputDirective>>();

  override onChangeCallback = model<() => void>();
  override onTouchedCallback = model<() => void>();
}
