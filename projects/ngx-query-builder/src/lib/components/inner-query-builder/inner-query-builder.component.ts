import {ChangeDetectionStrategy, Component, input, TemplateRef} from '@angular/core';
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
    readonly parentValue = input.required<RuleSet>();

    readonly parentArrowIconTemplate = input<QueryArrowIconDirective>();
    readonly parentInputTypeToTemplate = input.required<Map<string, QueryInputDirective>>();
    readonly parentOperatorTemplate = input<QueryOperatorDirective>();
    readonly parentFieldTemplate = input<QueryFieldDirective>();
    readonly parentEntityTemplate = input<QueryEntityDirective>();
    readonly parentSwitchGroupTemplate = input<QuerySwitchGroupDirective>();
    readonly parentButtonGroupTemplate = input<QueryButtonGroupDirective>();
    readonly parentRulesetAddRuleButtonTemplate = input<QueryRulesetAddRuleButtonDirective>();
    readonly parentRulesetAddRulesetButtonTemplate = input<QueryRulesetAddRulesetButtonDirective>();
    readonly parentRulesetRemoveButtonTemplate = input<QueryRulesetRemoveButtonDirective>();
    readonly parentRuleRemoveButtonTemplate = input<QueryRuleRemoveButtonDirective>();
    readonly parentEmptyWarningTemplate = input<QueryEmptyWarningDirective>();
    readonly parentChangeCallback = input<() => void>();
    readonly parentTouchedCallback = input<() => void>();

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
            parent.rules = parent.rules.filter((r) => r !== ruleset);
        }

        this.handleTouched();
        this.handleDataChange();
    }

    getRulesetRemoveButtonTemplate(): TemplateRef<any> | undefined {
        const t = this.parentRulesetRemoveButtonTemplate();
        return t?.template;
    }

    override findQueryInput(type: string): QueryInputDirective | undefined {
        return this.parentInputTypeToTemplate().get(type);
    }


    override getOperatorTemplate(): TemplateRef<any> | undefined {
        const t = this.parentOperatorTemplate();
        return t?.template;
    }

    override getFieldTemplate(): TemplateRef<any> | undefined {
        const t = this.parentFieldTemplate();
        return t?.template;
    }

    override getEntityTemplate(): TemplateRef<any> | undefined {
        const t = this.parentEntityTemplate();
        return t?.template;
    }

    override getArrowIconTemplate(): TemplateRef<any> | undefined {
        const t = this.parentArrowIconTemplate();
        return t?.template;
    }

    override getButtonGroupTemplate(): TemplateRef<any> | undefined {
        const t = this.parentButtonGroupTemplate();
        return t?.template;
    }

    override getSwitchGroupTemplate(): TemplateRef<any> | undefined {
        const t = this.parentSwitchGroupTemplate();
        return t?.template;
    }

    override getRulesetAddRuleButtonTemplate(): TemplateRef<any> | undefined {
        const t = this.parentRulesetAddRuleButtonTemplate();
        return t?.template;
    }

    override getRulesetAddRulesetButtonTemplate(): TemplateRef<any> | undefined {
        const t = this.parentRulesetAddRulesetButtonTemplate();
        return t?.template;
    }

    override getRuleRemoveButtonTemplate(): TemplateRef<any> | undefined {
        const t = this.parentRuleRemoveButtonTemplate();
        return t?.template;
    }

    override getEmptyWarningTemplate(): TemplateRef<any> | undefined {
        const t = this.parentEmptyWarningTemplate();
        return t?.template;
    }

    protected override handleDataChange(): void {
        super.handleDataChange();
        const parentChangeCallback = this.parentChangeCallback();
        if (parentChangeCallback) {
            parentChangeCallback();
        }
    }


    protected override handleTouched() {
        super.handleTouched();
        const parentTouchedCallback = this.parentTouchedCallback();
        if (parentTouchedCallback) {
            parentTouchedCallback();
        }
    }
}
