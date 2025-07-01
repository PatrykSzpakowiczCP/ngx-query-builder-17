import {ChangeDetectionStrategy, Component, contentChild, input, model, output, TemplateRef} from '@angular/core';
import {QueryBuilderComponent} from "../query-builder.component";
import {QueryArrowIconDirective} from "../../directives/query-arrow-icon.directive";
import {QueryInputDirective} from "../../directives/query-input.directive";
import {QueryOperatorDirective} from "../../directives/query-operator.directive";
import {QueryFieldDirective} from "../../directives/query-field.directive";
import {QueryEntityDirective} from "../../directives/query-entity.directive";
import {QuerySwitchGroupDirective} from "../../directives/query-switch-group.directive";
import {QueryButtonGroupDirective} from "../../directives/query-button-group.directive";
import {QueryRulesetAddRuleButtonDirective} from "../../directives/query-ruleset-add-rule-button.directive";
import {QueryRulesetAddRulesetButtonDirective} from "../../directives/query-ruleset-add-ruleset-button.directive";
import {QueryRulesetRemoveButtonDirective} from "../../directives/query-ruleset-remove-button.directive";
import {QueryRuleRemoveButtonDirective} from "../../directives/query-rule-remove-button.directive";
import {QueryEmptyWarningDirective} from "../../directives/query-empty-warning.directive";
import {
    ButtonGroupContext,
    LocalRuleMeta,
    Rule,
    RuleSet,
    RulesetRemoveButtonContext
} from "../../models/query-builder.interfaces";

@Component({
    selector: 'inner-query-builder',
    templateUrl: './inner-query-builder.component.html',
    styleUrl: '../query-builder.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InnerQueryBuilderComponent extends QueryBuilderComponent {
    readonly index = input.required<number>();
    readonly parentValue = model.required<RuleSet>();

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

    onDelete = output<void>()

    private rulesetRemoveButtonContextCache = new Map<Rule, RulesetRemoveButtonContext>();

    override getQueryRulesetClassName(local: LocalRuleMeta): string | undefined {
        let cls = this.getClassNames('ruleSet');
        if (local.invalid) {
            cls += ' ' + this.getClassNames('invalidRuleSet');
        }
        return cls;
    }

    override getButtonGroupContext(): ButtonGroupContext {
        if (!this.buttonGroupContext) {
            this.buttonGroupContext = {
                parentValue: this.parentValue(),
                addRule: this.addRule.bind(this),
                addRuleSet: this.allowRuleset() && this.addRuleSet.bind(this),
                removeRuleSet: this.allowRuleset() && this.parentValue() && this.removeRuleSet.bind(this),
                getDisabledState: this.getDisabledState,
                $implicit: this.data()
            };
        }
        return this.buttonGroupContext;
    }

    getRulesetRemoveButtonContext(rule: Rule): RulesetRemoveButtonContext | undefined {
        if (!this.rulesetRemoveButtonContextCache.has(rule)) {
            this.rulesetRemoveButtonContextCache.set(rule, {
                removeRuleSet: this.removeRuleSet.bind(this),
                getDisabledState: this.getDisabledState,
                $implicit: rule
            });
        }
        return this.rulesetRemoveButtonContextCache.get(rule);
    }

    removeRuleSet(ruleset?: RuleSet, parent?: RuleSet): void {
        if (this.disabled()) return;
        ruleset = ruleset || this.data();

        parent = parent || this.parentValue();
        const config = this.config();
        if (config.removeRuleSet) {
            config.removeRuleSet(ruleset, parent);
        } else {
            this.parentValue.update(rs => {
                rs.rules.splice(this.index(), 1)
                return rs;
            })
        }

        this.handleTouched();
        this.handleDataChange();
    }

}
