import {ControlValueAccessor, ValidationErrors, Validator} from '@angular/forms';
import {QueryOperatorDirective} from '../directives/query-operator.directive';
import {QueryFieldDirective} from '../directives/query-field.directive';
import {QueryEntityDirective} from '../directives/query-entity.directive';
import {QuerySwitchGroupDirective} from '../directives/query-switch-group.directive';
import {QueryButtonGroupDirective} from '../directives/query-button-group.directive';
import {QueryInputDirective} from '../directives/query-input.directive';
import {QueryRulesetAddRuleButtonDirective} from '../directives/query-ruleset-add-rule-button.directive';
import {QueryRulesetAddRulesetButtonDirective} from '../directives/query-ruleset-add-ruleset-button.directive';
import {QueryRulesetRemoveButtonDirective} from '../directives/query-ruleset-remove-button.directive';
import {QueryRuleRemoveButtonDirective} from '../directives/query-rule-remove-button.directive';
import {QueryEmptyWarningDirective} from '../directives/query-empty-warning.directive';
import {QueryArrowIconDirective} from '../directives/query-arrow-icon.directive';
import {
  ArrowIconContext,
  ButtonGroupContext,
  EmptyWarningContext,
  Entity,
  EntityContext,
  Field,
  FieldContext,
  InputContext,
  LocalRuleMeta,
  OperatorContext,
  Option,
  QueryBuilderClassNames,
  QueryBuilderConfig,
  Rule,
  RuleRemoveButtonContext,
  RuleSet,
  RulesetAddRuleButtonContext,
  RulesetAddRulesetButtonContext,
  RulesetRemoveButtonContext,
  SwitchGroupContext,
} from '../models/query-builder.interfaces';
import {
  AfterContentInit,
  ChangeDetectorRef,
  computed,
  Directive,
  ElementRef,
  Input,
  input,
  model,
  signal,
  Signal,
  TemplateRef,
  viewChild, WritableSignal
} from '@angular/core';

@Directive({})
export abstract class BaseQueryBuilder implements ControlValueAccessor, Validator, AfterContentInit {
  abstract isRoot(): boolean;

  // inputs
  readonly disabled = model(false);
  readonly data = model<RuleSet>({condition: 'and', rules: []});

  readonly level = input(0);
  readonly allowRuleset = input(true);
  readonly allowCollapse = input(false);
  readonly emptyMessage = input('A ruleset cannot be empty. Please add a rule or remove it all together.');
  readonly classNames = input<QueryBuilderClassNames>();
  readonly operatorMap = input<Record<string, string[]>>();
  readonly config = input<QueryBuilderConfig>({fields: {}});

  public fields = computed(() => Object.keys(this.config().fields).map((value) => {
    const field = this.config().fields[value];
    field.value = field.value || value;
    return field;
  }));

  public entities = computed(() => !this.config().entities ?
    [] :
    Object.keys(this.config().entities!).map((value) => {
      const entity = this.config().entities?.[value];
      if (entity) {
        entity.value = entity.value || value;
      }
      return entity;
    }).filter((entity) => entity !== undefined) as Entity[]
  );

  readonly persistValueOnFieldChange = input(false);

  // Needs to be undefined for the root
  abstract parentValue: WritableSignal<RuleSet | undefined>
  abstract index: Signal<number>

  // For ControlValueAccessor interface
  abstract onChangeCallback: WritableSignal<(() => void) | undefined>
  abstract onTouchedCallback: WritableSignal<(() => any) | undefined>


  public defaultClassNames: QueryBuilderClassNames = {
    switchRow: 'q-switch-row',
    arrowIconButton: 'q-arrow-icon-button',
    arrowIcon: 'q-icon q-arrow-icon',
    removeIcon: 'q-icon q-remove-icon',
    addIcon: 'q-icon q-add-icon',
    button: 'q-button',
    buttonGroup: 'q-button-group',
    removeButton: 'q-remove-button',
    switchGroup: 'q-switch-group',
    switchLabel: 'q-switch-label',
    switchRadio: 'q-switch-radio',
    rightAlign: 'q-right-align',
    transition: 'q-transition',
    collapsed: 'q-collapsed',
    treeContainer: 'q-tree-container',
    tree: 'q-tree',
    row: 'q-row',
    connector: 'q-connector',
    rule: 'q-rule',
    ruleContent: 'q-rule-content',
    ruleActions: 'q-rule-actions',
    ruleSet: 'q-ruleset',
    invalidRuleSet: 'q-invalid-ruleset',
    root: 'q-root',
    emptyWarning: 'q-empty-warning',
    fieldControl: 'q-field-control',
    fieldControlSize: 'q-control-size',
    entityControl: 'q-entity-control',
    entityControlSize: 'q-control-size',
    operatorControl: 'q-operator-control',
    operatorControlSize: 'q-control-size',
    inputControl: 'q-input-control',
    inputControlSize: 'q-control-size'
  };
  public defaultOperatorMap: Record<string, string[]> = {
    string: ['=', '!=', 'contains', 'like'],
    number: ['=', '!=', '>', '>=', '<', '<='],
    time: ['=', '!=', '>', '>=', '<', '<='],
    date: ['=', '!=', '>', '>=', '<', '<='],
    category: ['=', '!=', 'in', 'not in'],
    boolean: ['=']
  };

  readonly treeContainer = viewChild<ElementRef>('treeContainer');

  contentInit = signal(false)

  ngAfterContentInit(): void {
    setTimeout(() => this.contentInit.set(true)); // Avoid sending warning because templates aren't initialised yet
  }

  abstract buttonGroupTemplate: Signal<QueryButtonGroupDirective | undefined>;
  abstract switchGroupTemplate: Signal<QuerySwitchGroupDirective | undefined>;
  abstract fieldTemplate: Signal<QueryFieldDirective | undefined>;
  abstract entityTemplate: Signal<QueryEntityDirective | undefined>;
  abstract operatorTemplate: Signal<QueryOperatorDirective | undefined>;
  abstract rulesetAddRuleButtonTemplate: Signal<QueryRulesetAddRuleButtonDirective | undefined>;
  abstract rulesetAddRulesetButtonTemplate: Signal<QueryRulesetAddRulesetButtonDirective | undefined>;
  abstract rulesetRemoveButtonTemplate: Signal<QueryRulesetRemoveButtonDirective | undefined>;
  abstract ruleRemoveButtonTemplate: Signal<QueryRuleRemoveButtonDirective | undefined>;
  abstract emptyWarningTemplate: Signal<QueryEmptyWarningDirective | undefined>;
  abstract arrowIconTemplate: Signal<QueryArrowIconDirective | undefined>;
  abstract inputTypeToTemplate: Signal<Map<string, QueryInputDirective>>

  protected defaultTemplateTypes: string[] = [
    'string', 'number', 'time', 'date', 'category', 'boolean', 'multiselect'];
  protected defaultPersistValueTypes: string[] = [
    'string', 'number', 'time', 'date', 'boolean'];
  protected defaultEmptyList: any[] = [];
  // Reset cache on config change
  protected operatorsCache = computed<Record<string, string[]>>(() => this.config() && {});
  protected inputContextCache = new Map<Rule, InputContext>();
  protected operatorContextCache = new Map<Rule, OperatorContext>();
  protected fieldContextCache = new Map<Rule, FieldContext>();
  protected entityContextCache = new Map<Rule, EntityContext>();
  protected rulesetAddRuleButtonContextCache = new Map<Rule, RulesetAddRuleButtonContext>();
  protected rulesetAddRulesetButtonContextCache = new Map<Rule, RulesetAddRulesetButtonContext>();
  protected ruleRemoveButtonContextCache = new Map<Rule, RuleRemoveButtonContext>();
  protected buttonGroupContext!: ButtonGroupContext;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }


  // ----------Validator Implementation----------

  validate(): ValidationErrors | null {
    const errors: Record<string, any> = {};
    const ruleErrorStore: any[] = [];
    let hasErrors = false;

    const data = this.data();
    if (!this.config().allowEmptyRulesets && this.checkEmptyRuleInRuleset(data)) {
      errors['empty'] = 'Empty rulesets are not allowed.';
      hasErrors = true;
    }

    this.validateRulesInRuleset(data, ruleErrorStore);

    if (ruleErrorStore.length) {
      errors['rules'] = ruleErrorStore;
      hasErrors = true;
    }
    return hasErrors ? errors : null;
  }

  // ----------ControlValueAccessor Implementation----------


  @Input()
  get value(): RuleSet {
    return this.data();
  }

  set value(value: RuleSet) {
    // When component is initialized without a formControl, null is passed to value
    this.data.set(value || {condition: 'and', rules: []});
    this.handleDataChange();
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback.set(() => fn(this.data()));
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback.set(() => fn(this.data()));
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    this.changeDetectorRef.detectChanges();
  }

  // ----------END----------

  getDisabledState = (): boolean => {
    return this.disabled();
  }

  findTemplateForRule(rule: Rule): TemplateRef<any> | undefined {
    const type = this.getInputType(rule.field, rule.operator);
    if (type) {
      const queryInput = this.findQueryInput(type);
      if (queryInput) {
        return queryInput.template;
      } else {
        if (this.defaultTemplateTypes.indexOf(type) === -1 && this.contentInit()) {
          console.warn(`Could not find template for field with type: ${type}`);
        }
      }
    }
    return undefined;
  }

  findQueryInput(type: string): QueryInputDirective | undefined {
    return this.inputTypeToTemplate().get(type)
  }

  getOperators(field: string): string[] {
    if (this.operatorsCache()[field]) {
      return this.operatorsCache()[field];
    }
    let operators = this.defaultEmptyList;
    const fieldObject = this.config().fields[field];

    const config = this.config();
    if (config.getOperators) {
      return config.getOperators(field, fieldObject);
    }

    const type = fieldObject.type;

    if (fieldObject && fieldObject.operators) {
      operators = fieldObject.operators;
    } else if (type) {
      const operatorMap = this.operatorMap();
      operators = (operatorMap && operatorMap[type]) || this.defaultOperatorMap[type] || this.defaultEmptyList;
      if (operators.length === 0) {
        console.warn(
          `No operators found for field '${field}' with type ${fieldObject.type}. ` +
          `Please define an 'operators' property on the field or use the 'operatorMap' binding to fix this.`);
      }
      if (fieldObject.nullable) {
        operators = operators.concat(['is null', 'is not null']);
      }
    } else {
      console.warn(`No 'type' property found on field: '${field}'`);
    }

    // Cache reference to array object, so it won't be computed next time and trigger a rerender.
    this.operatorsCache()[field] = operators;
    return operators;
  }

  getFields(entity: string): Field[] {
    if (this.entities() && this.entities().length > 0 && entity) {
      return this.fields().filter((field) => {
        return field && field.entity === entity;
      });
    } else {
      return this.fields();
    }
  }

  getInputType(field: string, operator: string): string | undefined {
    const config = this.config();
    if (config.getInputType) {
      return config.getInputType(field, operator);
    }

    if (!config.fields[field]) {
      throw new Error(`No configuration for field '${field}' could be found! Please add it to config.fields.`);
    }

    const type = config.fields[field].type;
    switch (operator) {
      case 'is null':
      case 'is not null':
        return undefined;  // No displayed component
      case 'in':
      case 'not in':
        return type === 'category' || type === 'boolean' ? 'multiselect' : type;
      default:
        return type;
    }
  }

  getOptions(field: string): Option[] {
    const config = this.config();
    if (config.getOptions) {
      return config.getOptions(field);
    }
    return config.fields[field].options || this.defaultEmptyList;
  }

  getClassNames(...args: any[]): string | undefined {
    const classNamesValue = this.classNames();
    const clsLookup = classNamesValue ? classNamesValue : this.defaultClassNames;
    const classNames = args.map((id) => (clsLookup as any)[id] || (this.defaultClassNames as any)[id]).filter((c) => !!c);
    return classNames.length ? classNames.join(' ') : undefined;
  }

  getDefaultField(entity: Entity | undefined): Field | undefined {
    if (!entity) {
      return undefined;
    } else if (entity.defaultField !== undefined) {
      return this.getDefaultValue(entity.defaultField);
    } else {
      const entityFields = this.fields().filter((field) => {
        return field && field.entity === entity.value;
      });
      if (entityFields && entityFields.length) {
        return entityFields[0];
      } else {
        console.warn(`No fields found for entity '${entity.name}'. ` +
          `A 'defaultOperator' is also not specified on the field config. Operator value will default to null.`);
        return undefined;
      }
    }
  }

  getDefaultOperator(field: Field): string | undefined {
    if (field && field.defaultOperator !== undefined) {
      return this.getDefaultValue(field.defaultOperator);
    } else {
      const operators = field && field.value ? this.getOperators(field.value) : [];
      if (operators && operators.length) {
        return operators[0];
      } else {
        console.warn(`No operators found for field '${field?.value}'. ` +
          `A 'defaultOperator' is also not specified on the field config. Operator value will default to null.`);
        return undefined;
      }
    }
  }

  addRule(parent?: RuleSet): void {
    if (this.disabled()) {
      return;
    }

    parent = parent || this.data();
    const config = this.config();
    if (config.addRule) {
      config.addRule(parent);
    } else {
      const field = this.fields()[0];
      if (field.value) {
        parent.rules = parent.rules.concat([{
          field: field.value,
          operator: this.getDefaultOperator(field) || '',
          value: this.getDefaultValue(field.defaultValue),
          entity: field.entity
        } as Rule] as Rule[]);
      }
    }

    this.handleTouched();
    this.handleDataChange();
  }

  removeRule(rule: Rule, parent?: RuleSet): void {
    if (this.disabled()) {
      return;
    }

    parent = parent || this.data();
    const config = this.config();
    if (config.removeRule) {
      config.removeRule(rule, parent);
    } else {
      parent.rules = parent.rules.filter((r) => r !== rule);
    }
    this.inputContextCache.delete(rule);
    this.operatorContextCache.delete(rule);
    this.fieldContextCache.delete(rule);
    this.entityContextCache.delete(rule);
    this.ruleRemoveButtonContextCache.delete(rule);

    this.handleTouched();
    this.handleDataChange();
  }

  private rulesetRemoveButtonContextCache = new Map<Rule, RulesetRemoveButtonContext>();


  removeRuleSet(ruleset?: RuleSet, parent?: RuleSet): void {
    if (this.disabled()) return;
    ruleset = ruleset || this.data();

    parent = parent || this.parentValue();
    if (!parent) return; // Cannot remove root
    const config = this.config();
    if (config.removeRuleSet) {
      config.removeRuleSet(ruleset, parent);
    } else {
      this.parentValue.update(rs => {
        rs!.rules.splice(this.index(), 1)
        return rs;
      })
    }

    this.handleTouched();
    this.handleDataChange();
  }

  addRuleSet(parent?: RuleSet): void {
    if (this.disabled()) {
      return;
    }

    parent = parent || this.data();
    const config = this.config();
    if (config.addRuleSet) {
      config.addRuleSet(parent);
    } else {
      parent.rules = parent.rules.concat([{condition: 'and', rules: []}]);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  transitionEnd(): void {
    const treeContainer = this.treeContainer();
    if (treeContainer) {
      treeContainer.nativeElement.style.maxHeight = null;
    }
  }

  toggleCollapse(): void {
    this.computedTreeContainerHeight();
    setTimeout(() => {
      this.data.update(d => ({...d, collapsed: !d.collapsed}));
    }, 100);
  }

  computedTreeContainerHeight(): void {
    const nativeElement: HTMLElement = this.treeContainer()?.nativeElement;
    if (nativeElement && nativeElement.firstElementChild) {
      nativeElement.style.maxHeight = (nativeElement.firstElementChild.clientHeight + 8) + 'px';
    }
  }

  changeCondition(value: string): void {
    if (this.disabled()) {
      return;
    }

    this.data().condition = value;
    this.handleTouched();
    this.handleDataChange();
  }

  changeOperator(rule: Rule): void {
    if (this.disabled()) {
      return;
    }

    const config = this.config();
    if (config.coerceValueForOperator) {
      rule.value = config.coerceValueForOperator(rule.operator, rule.value, rule);
    } else {
      rule.value = this.coerceValueForOperator(rule.operator, rule.value, rule);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  coerceValueForOperator(operator: string, value: any, rule: Rule): any {
    const inputType: string | undefined = this.getInputType(rule.field, operator);
    if (inputType === 'multiselect' && !Array.isArray(value)) {
      return [value];
    }
    return value;
  }

  changeInput(): void {
    if (this.disabled()) {
      return;
    }

    this.handleTouched();
    this.handleDataChange();
  }

  changeField(fieldValue: string, rule: Rule): void {
    if (this.disabled()) {
      return;
    }

    const inputContext = this.inputContextCache.get(rule);
    const currentField = inputContext && inputContext.field;

    const nextField: Field = this.config().fields[fieldValue];

    const nextValue = this.calculateFieldChangeValue(
      currentField, nextField, rule.value);

    if (nextValue !== undefined) {
      rule.value = nextValue;
    } else {
      delete rule.value;
    }

    rule.operator = this.getDefaultOperator(nextField) || '';

    // Create new context objects so templates will automatically update
    this.inputContextCache.delete(rule);
    this.operatorContextCache.delete(rule);
    this.fieldContextCache.delete(rule);
    this.entityContextCache.delete(rule);
    this.getInputContext(rule);
    this.getFieldContext(rule);
    this.getOperatorContext(rule);
    this.getEntityContext(rule);

    this.handleTouched();
    this.handleDataChange();
  }

  changeEntity(entityValue: string, rule: Rule, index: number, data: RuleSet): void {
    if (this.disabled()) {
      return;
    }
    let i = index;
    let rs = data;
    const entity: Entity | undefined = this.entities().find((e) => e?.value === entityValue);
    const defaultField: Field | undefined = this.getDefaultField(entity);
    if (!rs) {
      rs = this.data();
      i = rs.rules.findIndex((x) => x === rule);
    }
    rule.field = defaultField && defaultField.value || '';
    rs.rules[i] = rule;
    if (defaultField) {
      this.changeField(rule.field, rule);
    } else {
      this.handleTouched();
      this.handleDataChange();
    }
  }

  getDefaultValue(defaultValue: any): any {
    switch (typeof defaultValue) {
      case 'function':
        return defaultValue();
      default:
        return defaultValue;
    }
  }

  getOperatorTemplate(): TemplateRef<any> | undefined {
    const t = this.operatorTemplate();
    return t?.template;
  }

  getFieldTemplate(): TemplateRef<any> | undefined {
    const t = this.fieldTemplate();
    return t?.template;
  }

  getEntityTemplate(): TemplateRef<any> | undefined {
    const t = this.entityTemplate();
    return t?.template;
  }

  getArrowIconTemplate(): TemplateRef<any> | undefined {
    const t = this.arrowIconTemplate();
    return t?.template;
  }

  getButtonGroupTemplate(): TemplateRef<any> | undefined {
    const t = this.buttonGroupTemplate();
    return t?.template;
  }

  getSwitchGroupTemplate(): TemplateRef<any> | undefined {
    const t = this.switchGroupTemplate();
    return t?.template;
  }

  getRulesetAddRuleButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.rulesetAddRuleButtonTemplate();
    return t?.template;
  }

  getRulesetAddRulesetButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.rulesetAddRulesetButtonTemplate();
    return t?.template;
  }

  getRuleRemoveButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.ruleRemoveButtonTemplate();
    return t?.template;
  }

  getRulesetRemoveButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.rulesetRemoveButtonTemplate();
    return t?.template;
  }

  getEmptyWarningTemplate(): TemplateRef<any> | undefined {
    const t = this.emptyWarningTemplate();
    return t?.template;
  }

  getQueryItemClassName(): string | undefined {
    return this.getClassNames('row', 'connector', 'transition');
  }

  getQueryRulesetClassName(local: LocalRuleMeta): string | undefined {
    if (this.isRoot() && !this.config().wrapRoot) return;
    let cls = this.getClassNames('ruleSet');
    if (local.invalid) cls += ' ' + this.getClassNames('invalidRuleSet');
    if (this.isRoot()) cls += ' ' + this.getClassNames('root');
    return cls;
  }

  getQueryRuleClassName(): string | undefined {
    return this.getClassNames('rule');
  }

  getButtonGroupContext(): ButtonGroupContext {
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

  getRulesetAddRuleButtonContext(rule: Rule): RulesetAddRuleButtonContext | undefined {
    if (!this.rulesetAddRuleButtonContextCache.has(rule)) {
      this.rulesetAddRuleButtonContextCache.set(rule, {
        addRule: this.addRule.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule
      });
    }
    return this.rulesetAddRuleButtonContextCache.get(rule);
  }

  getRulesetAddRulesetButtonContext(rule: Rule): RulesetAddRulesetButtonContext | undefined {
    if (!this.rulesetAddRulesetButtonContextCache.has(rule)) {
      this.rulesetAddRulesetButtonContextCache.set(rule, {
        addRuleSet: this.addRuleSet.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule
      });
    }
    return this.rulesetAddRulesetButtonContextCache.get(rule);
  }


  getRuleRemoveButtonContext(rule: Rule): RuleRemoveButtonContext | undefined {
    if (!this.ruleRemoveButtonContextCache.has(rule)) {
      this.ruleRemoveButtonContextCache.set(rule, {
        removeRule: this.removeRule.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule
      });
    }
    return this.ruleRemoveButtonContextCache.get(rule);
  }

  getFieldContext(rule: Rule): FieldContext | undefined {
    if (!this.fieldContextCache.has(rule)) {
      this.fieldContextCache.set(rule, {
        onChange: this.changeField.bind(this),
        getFields: this.getFields.bind(this),
        getDisabledState: this.getDisabledState,
        fields: this.fields(),
        $implicit: rule
      });
    }
    return this.fieldContextCache.get(rule);
  }

  getEntityContext(rule: Rule): EntityContext | undefined {
    if (!this.entityContextCache.has(rule)) {
      this.entityContextCache.set(rule, {
        onChange: this.changeEntity.bind(this),
        getDisabledState: this.getDisabledState,
        entities: this.entities(),
        $implicit: rule
      });
    }
    return this.entityContextCache.get(rule);
  }

  getSwitchGroupContext(): SwitchGroupContext {
    return {
      onChange: this.changeCondition.bind(this),
      getDisabledState: this.getDisabledState,
      $implicit: this.data()
    };
  }

  getArrowIconContext(): ArrowIconContext {
    return {
      getDisabledState: this.getDisabledState,
      $implicit: this.data()
    };
  }

  getEmptyWarningContext(): EmptyWarningContext {
    return {
      getDisabledState: this.getDisabledState,
      message: this.emptyMessage(),
      $implicit: this.data()
    };
  }

  getOperatorContext(rule: Rule): OperatorContext | undefined {
    if (!this.operatorContextCache.has(rule)) {
      this.operatorContextCache.set(rule, {
        onChange: this.changeOperator.bind(this),
        getDisabledState: this.getDisabledState,
        operators: this.getOperators(rule.field),
        $implicit: rule
      });
    }
    return this.operatorContextCache.get(rule);
  }

  getInputContext(rule: Rule): InputContext | undefined {
    if (!this.inputContextCache.has(rule)) {
      this.inputContextCache.set(rule, {
        onChange: this.changeInput.bind(this),
        getDisabledState: this.getDisabledState,
        options: this.getOptions(rule.field),
        field: this.config().fields[rule.field],
        $implicit: rule
      });
    }
    return this.inputContextCache.get(rule);
  }

  isRule(rule: Rule | RuleSet): rule is Rule {
    return !(rule as RuleSet).rules;
  }

  isRuleset(rule: Rule | RuleSet): rule is RuleSet {
    return !!(rule as RuleSet).rules;
  }

  isEmptyRuleset(rule: any): boolean {
    return rule.rules && rule.rules.length === 0;
  }

  private calculateFieldChangeValue(
    currentField: Field | undefined,
    nextField: Field | undefined,
    currentValue: any
  ): any {

    const config = this.config();
    if (config.calculateFieldChangeValue) {
      return config.calculateFieldChangeValue(
        currentField, nextField, currentValue);
    }

    const canKeepValue = () => {
      if (!currentField || !nextField) {
        return false;
      }
      return currentField.type === nextField.type
        && this.defaultPersistValueTypes.indexOf(currentField.type) !== -1;
    };

    if (this.persistValueOnFieldChange() && canKeepValue()) {
      return currentValue;
    }

    if (nextField && nextField.defaultValue !== undefined) {
      return this.getDefaultValue(nextField.defaultValue);
    }

    return undefined;
  }

  private checkEmptyRuleInRuleset(ruleset: RuleSet): boolean {
    if (!ruleset || !ruleset.rules || ruleset.rules.length === 0) {
      return true;
    } else {
      return ruleset.rules.some((item: RuleSet | Rule) => {
        if ((item as RuleSet).rules) {
          return this.checkEmptyRuleInRuleset(item as RuleSet);
        } else {
          return false;
        }
      });
    }
  }

  private validateRulesInRuleset(ruleset: RuleSet, errorStore: any[]) {
    if (ruleset && ruleset.rules && ruleset.rules.length > 0) {
      ruleset.rules.forEach((item) => {
        if ((item as RuleSet).rules) {
          return this.validateRulesInRuleset(item as RuleSet, errorStore);
        } else if ((item as Rule).field) {
          const field = this.config().fields[(item as Rule).field];
          if (field && field.validator) {
            const error = field.validator(item as Rule, ruleset);
            if (error != null) {
              errorStore.push(error);
            }
          }
        }
      });
    }
  }

  protected handleDataChange(): void {
    this.changeDetectorRef.markForCheck();
    if (this.onChangeCallback()) {
      this.onChangeCallback()!();
    }
  }

  protected handleTouched(): void {
    if (this.onTouchedCallback()) {
      this.onTouchedCallback()!();
    }
  }

}
