# @patryk-szpakowicz/ngx-query-builder-17

[![npm version](https://badge.fury.io/js/@patryk-szpakowicz%2Fngx-query-builder-17.svg)](https://badge.fury.io/js/@patryk-szpakowicz%2Fngx-query-builder-17)

**Angular 17.3.12 Compatible Query Builder with Signal Queries**

A modernized Angular 17+ query builder with signal query support, forked from [@eliot-ragueneau/ngx-query-builder](https://github.com/EliotRagueneau/ngx-query-builder) and downgraded for Angular 17.3.x compatibility.

## ✨ **What's Special About This Fork**

- **🎯 Angular 17.3.12 Compatible** - Specifically downgraded for Angular 17 projects
- **🚀 Signal Queries Preserved** - Maintains modern `contentChild()` and `contentChildren()` APIs (available since Angular 17.2.0)
- **📦 Zero Breaking Changes** - Identical API to the original Angular 20 version
- **🔧 Production Ready** - Fully tested and validated with comprehensive test suite

## 🚨 **Why This Fork Exists**

The original `@eliot-ragueneau/ngx-query-builder` targets Angular 20+, but many production applications are still on Angular 17.x LTS. This fork provides:

1. **Backward Compatibility** - Works with Angular 17.3.x
2. **Modern API Support** - Keeps signal queries instead of downgrading to legacy decorators
3. **Stable Dependencies** - Exact version alignment with Angular 17 ecosystem

## 📋 **Version Compatibility**

| Angular Version | Package Version | Signal Queries |
|----------------|----------------|----------------|
| 17.3.x | `@patryk-szpakowicz/ngx-query-builder-17` | ✅ Supported |
| 20.x | `@eliot-ragueneau/ngx-query-builder` | ✅ Supported |

# Getting Started

## Install

```bash
npm install @patryk-szpakowicz/ngx-query-builder-17
```

## Usage

```typescript
import { QueryBuilderModule } from '@patryk-szpakowicz/ngx-query-builder-17';

@NgModule({
  imports: [QueryBuilderModule]
})
export class AppModule {}
```

## Credits

- **Original Creator**: [@zebzhao](https://github.com/zebzhao/Angular-QueryBuilder) - Initial Angular QueryBuilder implementation
- **Angular 20 Version**: [@eliot-ragueneau](https://github.com/EliotRagueneau/ngx-query-builder) - Modernized for Angular 20+
- **Angular 17 Fork**: [@PatrykSzpakowiczCP](https://github.com/PatrykSzpakowiczCP) - Downgraded for Angular 17.3.x compatibility

---

- Angular 9, use 0.6.0
- Angular 8, use 0.5.1
- Angular 6-7, use 0.4.2
- Angular 4-5, use 0.3.2

`npm install angular2-query-builder`

See https://github.com/zebzhao/Angular-QueryBuilder for more details on the usage of the old version.

# Examples

## Basic Usage

##### `app.module.ts`

```javascript
import {QueryBuilderModule} from "@eliot-ragueneau/ngx-query-builder";
import {AppComponent} from "./app.component"

@NgModule({
  imports: [...,
  QueryBuilderModule,
  IonicModule.forRoot(AppComponent) // (Optional) for IonicFramework 2+
]})
export class AppModule {
}
```

##### `app.component.html`

```html
...
<ngx-query-builder [(ngModel)]='query' [config]='config'></ngx-query-builder>
...
```

##### `app.component.ts`

```javascript
import {QueryBuilderConfig} from '@eliot-ragueneau/ngx-query-builder';

export class AppComponent {
  query = {
    condition: 'and',
    rules: [
      {field: 'age', operator: '<=', value: 'Bob'},
      {field: 'gender', operator: '>=', value: 'm'}
    ]
  };

  config: QueryBuilderConfig = {
    fields: {
      age: {name: 'Age', type: 'number'},
      gender: {
        name: 'Gender',
        type: 'category',
        options: [
          {name: 'Male', value: 'm'},
          {name: 'Female', value: 'f'}
        ]
      }
    }
  }
}
```

## Custom Input Components

##### `app.component.html`

```html

<ngx-query-builder [(ngModel)]='query' [config]='config'>
  <ng-container *queryInput="let rule; type: 'date'">
    <custom-datepicker [(ngModel)]="rule.value"></custom-datepicker>
  </ng-container>
</ngx-query-builder>
```

##### `app.component.ts`

```javascript
query = {
  condition: 'and',
  rules: [
    {field: 'birthday', operator: '=', value: new Date()}
  ]
};

config: QueryBuilderConfig = {
  fields: {
    birthday: {
      name: 'Birthday',
      type: 'date',
      operators: ['=', '<=', '>'],
      defaultValue: () => new Date()
    }
  }
}
```

## Property Bindings Quick Reference

#### `ngx-query-builder`

| Name                               | Type                                                                                                   | Required | Default                         | Description                                                                                                                                                                                                                      |
|:-----------------------------------|:-------------------------------------------------------------------------------------------------------|:---------|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `allowRuleset`                     | `boolean`                                                                                              | Optional | `true`                          | Displays the `+ Ruleset` button if `true`.                                                                                                                                                                                       |
| `allowCollapse`                    | `boolean`                                                                                              | Optional | `false`                         | Enables collapsible rule sets if `true`.                                                                                                                                                                                         |
| `classNames`                       | [`QueryBuilderClassNames`](/projects/ngx-query-builder/src/lib/models/query-builder.interfaces.ts#L48) | Optional |                                 | CSS class names for different child elements in `query-builder` component.                                                                                                                                                       |
| `config`                           | [`QueryBuilderConfig`](/projects/ngx-query-builder/src/lib/models/query-builder.interfaces.ts#L85)     | Required |                                 | Configuration object for the main component.                                                                                                                                                                                     |
| `data`                             | [`Ruleset`](/projects/ngx-query-builder/src/lib/models/query-builder.interfaces.ts)                    | Optional | { condition: 'and', rules: [] } | (Use `ngModel` or `value` instead.)                                                                                                                                                                                              |
| `emptyMessage`                     | `string`                                                                                               | Optional |                                 | Message to display for an empty Ruleset if empty rulesets are not allowed.                                                                                                                                                       |
| `ngModel`                          | [`Ruleset`](/projects/ngx-query-builder/src/lib/models/query-builder.interfaces.ts)                    | Optional | { condition: 'and', rules: [] } | Object that stores the state of the component. Supports 2-way binding.                                                                                                                                                           |
| `operatorMap`                      | `{ [key: string]: string[] }`                                                                          | Optional |                                 | Used to map field types to list of operators.                                                                                                                                                                                    |
| `persistValueOnFieldChange`        | `boolean`                                                                                              | Optional | `false`                         | If `true`, when a field changes to another of the same type, and the type is one of: string, number, time, date, or boolean, persist the previous value. This option is ignored if config.calculateFieldChangeValue is provided. |
| `config.calculateFieldChangeValue` | `(currentField: Field, nextField: Field, currentValue: any) => any`                                    | Optional |                                 | Used to calculate the new value when a rule's field changes.                                                                                                                                                                     |
| `value`                            | [`Ruleset`](/projects/ngx-query-builder/src/lib/models/query-builder.interfaces.ts)                    | Optional | { condition: 'and', rules: [] } | Object that stores the state of the component.                                                                                                                                                                                   |

## Structural Directives

Use these directives to replace different parts of query builder with custom components.

#### `queryArrowIcon`

Directive to replace the expand arrow used in collapse/accordion mode of the query builder.

| Context Name       | Type            | Description                                                 |
|:-------------------|:----------------|:------------------------------------------------------------|
| `$implicit`        | `RuleSet`       | Current rule set object which contain a list of child rules |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component |

#### `querySwitchGroup`

Useful for replacing the switch controls, for example the AND/OR conditions. More custom conditions can be specified by using this directive to override the default component.

| Context Name       | Type            | Description                                                 |
|:-------------------|:----------------|:------------------------------------------------------------|
| `$implicit`        | `RuleSet`       | Current rule set object which contain a list of child rules |
| `onChange`         | `() => void`    | Callback to handle changes to the switch group component    |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component |

#### `queryButtonGroup`

For replacing the default button group for Add, Add Ruleset, Remove Ruleset buttons.

| Context Name       | Type            | Description                                                 |
|:-------------------|:----------------|:------------------------------------------------------------|
| `$implicit`        | `RuleSet`       | Current rule set object which contain a list of child rules |
| `parentValue`      | `RuleSet`       | For parent node's data if exists                            |
| `addRule`          | `() => void`    | Function to handle adding a new rule                        |
| `addRuleSet`       | `() => void`    | Function to handle adding a new rule set                    |
| `removeRuleSet`    | `() => void`    | Function to handle removing the current rule set            |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component |

#### `queryRulesetAddRuleButton`

For replacing the default button for Add Rule.

| Context Name       | Type            | Description                                                 |
|:-------------------|:----------------|:------------------------------------------------------------|
| `$implicit`        | `RuleSet`       | Current rule set object which contain a list of child rules |
| `addRule`          | `() => void`    | Function to handle adding a new rule                        |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component |

#### `queryRulesetAddRulesetButton`

For replacing the default button for Add Ruleset.

| Context Name       | Type            | Description                                                 |
|:-------------------|:----------------|:------------------------------------------------------------|
| `$implicit`        | `RuleSet`       | Current rule set object which contain a list of child rules |
| `addRuleSet`       | `() => void`    | Function to handle adding a new rule set                    |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component |

#### `queryRulesetRemoveButton`

For replacing the default button for Remove Ruleset.

| Context Name       | Type            | Description                                                 |
|:-------------------|:----------------|:------------------------------------------------------------|
| `$implicit`        | `RuleSet`       | Current rule set object which contain a list of child rules |
| `removeRuleSet`    | `() => void`    | Function to handle removing the current rule set            |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component |

#### `queryEntity`

Used to replace entity selection component.

| Context Name       | Type                                        | Description                                                       |
|:-------------------|:--------------------------------------------|:------------------------------------------------------------------|
| `$implicit`        | `Rule`                                      | Current rule object which contains the field, value, and operator |
| `entities`         | `Entity[]`                                  | List of entities for the component, specified by `config`         |
| `onChange`         | `(entityValue: string, rule: Rule) => void` | Callback to handle changes to the entity component                |
| `getDisabledState` | `() => boolean`                             | Retrieves or determines the disabled state of the component       |

#### `queryField`

Used this directive to replace the query field selection component.

| Context Name       | Type                                       | Description                                                       |
|:-------------------|:-------------------------------------------|:------------------------------------------------------------------|
| `$implicit`        | `Rule`                                     | Current rule object which contains the field, value, and operator |
| `getFields`        | `(entityName: string) => void`             | Get the list of fields corresponding to an entity                 |
| `fields`           | `Field[]`                                  | List of fields for the component, specified by `config`           |
| `onChange`         | `(fieldValue: string, rule: Rule) => void` | Callback to handle changes to the field component                 |
| `getDisabledState` | `() => boolean`                            | Retrieves or determines the disabled state of the component       |

#### `queryOperator`

Used to replace the query operator selection component.

| Context Name       | Type            | Description                                                       |
|:-------------------|:----------------|:------------------------------------------------------------------|
| `$implicit`        | `Rule`          | Current rule object which contains the field, value, and operator |
| `operators`        | `string[]`      | List of operators for the field, returned by `getOperators`       |
| `onChange`         | `() => void`    | Callback to handle changes to the operator component              |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component       |

#### `queryInput`

Used to replace the input component. Specify the type/queryInputType to match specific field types to input template.

| Context Name       | Type            | Description                                                       |
|:-------------------|:----------------|:------------------------------------------------------------------|
| `$implicit`        | `Rule`          | Current rule object which contains the field, value, and operator |
| `field`            | `Field`         | Current field object which contains the field's value and name    |
| `options`          | `Option[]`      | List of options for the field, returned by `getOptions`           |
| `onChange`         | `() => void`    | Callback to handle changes to the input component                 |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component       |

#### `queryRuleRemoveButton`

Directive to replace the default remove single rule button component.

| Context Name       | Type                   | Description                                                       |
|:-------------------|:-----------------------|:------------------------------------------------------------------|
| `$implicit`        | `Rule`                 | Current rule object which contains the field, value, and operator |
| `removeRule`       | `(rule: Rule) => void` | Function to handle removing a rule                                |
| `getDisabledState` | `() => boolean`        | Retrieves or determines the disabled state of the component       |

#### `queryEmptyWarning`

Can be used to customize the default empty warning message, alternatively can specify the `emptyMessage` property binding.

| Context Name       | Type            | Description                                                 |
|:-------------------|:----------------|:------------------------------------------------------------|
| `$implicit`        | `RuleSet`       | Current rule set object which contain a list of child rules |
| `message`          | `string`        | Value passed to `emptyMessage`                              |
| `getDisabledState` | `() => boolean` | Retrieves or determines the disabled state of the component |

## Dependencies

- Angular 18+

# Development

## dev

* `pnpm watch`
* `pnpm start`
* vist http://localhost:4200 to see the demo

### demo preview

![demo](/projects/ngx-query-builder-demo/preview/1.png)
![demo](/projects/ngx-query-builder-demo/preview/2.png)

### Code structure

- BaseQueryBuilder (Logic container - hidden)
  - QueryBuilderComponent (Root component - **exported**)
  - InnerQueryBuilderComponent (Recursive component - hidden)

## build

* `pnpm build`

## publish

```bash
cd dist/ngx-query-builder
npm publish --access public
```

## For use in other local projects

```bash
cd dist/ngx-query-builder
npm link

cd /path/to/other/project
npm link ngx-query-builder
```

That's it.
