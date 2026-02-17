# Tel Input Reka-UI

International telephone input component for Vue 3, built with [Reka UI](https://reka-ui.com) primitives. A modern reimplementation of [vue-tel-input](https://github.com/iamstevendao/vue-tel-input) designed for shadcn-vue projects.

![npm version](https://img.shields.io/npm/v/tel-input-reka-ui)
![license](https://img.shields.io/npm/l/tel-input-reka-ui)

## Features

- Built with Reka UI Combobox primitives for accessible, headless UI
- Virtual scrolling for 200+ countries with smooth performance
- Phone number validation and formatting via `libphonenumber-js`
- Styled with Tailwind CSS using shadcn-vue CSS variables
- Full TypeScript support
- E.164 number output via `v-model:number`
- International/national formatting modes

## Installation

```bash
npm install tel-input-reka-ui
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install vue@^3.4.0 reka-ui@>=1.0.0 lucide-vue-next@>=0.300.0 libphonenumber-js@^1.10.0
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TelInput } from 'tel-input-reka-ui'
import 'tel-input-reka-ui/style.css'

const phone = ref('')
const e164Number = ref('')
</script>

<template>
  <TelInput
    v-model="phone"
    v-model:number="e164Number"
    mode="international"
    :preferred-countries="['us', 'gb', 'ca']"
  />
</template>
```

## Props

### Main Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The phone number value for v-model binding |
| `mode` | `'auto' \| 'international' \| 'national'` | `'auto'` | Format mode. `international` adds dial code prefix |
| `defaultCountry` | `string \| number` | `''` | Default country by ISO2 code or dial code |
| `autoDefaultCountry` | `boolean` | `true` | Fetch default country based on user's IP |
| `disabled` | `boolean` | `false` | Disable the entire component |
| `autoFormat` | `boolean` | `true` | Auto-format the phone number when valid |
| `validCharactersOnly` | `boolean` | `false` | Only allow valid phone number characters |
| `customValidate` | `boolean \| RegExp` | `false` | Custom validation RegExp |
| `invalidMsg` | `string` | `''` | Custom invalid message for form validation |
| `styleClasses` | `string \| string[] \| Record<string, boolean>` | `''` | Custom classes for the wrapper |

### Country Filtering Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preferredCountries` | `string[]` | `[]` | Countries shown at top of dropdown (ISO2 codes) |
| `onlyCountries` | `string[]` | `[]` | Only show these countries in dropdown |
| `ignoredCountries` | `string[]` | `[]` | Hide these countries from dropdown |
| `allCountries` | `CountryObject[]` | All countries | Override the default country list |

### Dropdown Options

Pass via the `dropdownOptions` prop:

```vue
<TelInput :dropdown-options="{ showSearchBox: true, showFlags: true }" />
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `showDialCodeInList` | `boolean` | `true` | Show dial code in dropdown list |
| `showDialCodeInSelection` | `boolean` | `false` | Show dial code in selected country |
| `showFlags` | `boolean` | `true` | Show country flags |
| `showSearchBox` | `boolean` | `false` | Show search box in dropdown |
| `searchBoxPlaceholder` | `string` | `''` | Placeholder for search box |
| `tabindex` | `number` | `0` | Tabindex for dropdown trigger |
| `ariaLabel` | `string` | `''` | Aria-label for dropdown |

### Input Options

Pass via the `inputOptions` prop:

```vue
<TelInput :input-options="{ placeholder: 'Phone number', showDialCode: true }" />
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | `string` | `'Enter a phone number'` | Input placeholder |
| `showDialCode` | `boolean` | `false` | Show dial code in input |
| `autocomplete` | `string` | `'on'` | Native autocomplete attribute |
| `autofocus` | `boolean` | `false` | Auto focus on mount |
| `id` | `string` | `''` | Input id attribute |
| `name` | `string` | `'telephone'` | Input name attribute |
| `type` | `string` | `'tel'` | Input type attribute |
| `maxlength` | `number` | `25` | Max length of input |
| `required` | `boolean` | `false` | Mark input as required |
| `readonly` | `boolean` | `false` | Make input readonly |
| `tabindex` | `number` | `0` | Input tabindex |
| `styleClasses` | `string \| string[] \| Record<string, boolean>` | `''` | Custom classes for input |
| `aria-describedby` | `string` | `''` | Aria-describedby attribute |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted for v-model binding (formatted number) |
| `update:number` | `string \| undefined` | Emits the E.164 formatted number (e.g., `+14155552671`) |
| `on-input` | `(number: string, phoneObject: PhoneObject)` | Fires on every input change |
| `validate` | `PhoneObject` | Fires when validity changes or on mount |
| `country-changed` | `CountryObject` | Fires when selected country changes |
| `focus` | `void` | Fires on input focus |
| `blur` | `void` | Fires on input blur |
| `enter` | `void` | Fires on Enter key |
| `space` | `void` | Fires on Space key |
| `open` | `void` | Fires when dropdown opens |
| `close` | `void` | Fires when dropdown closes |

## TypeScript

The package includes full TypeScript definitions:

```typescript
import { TelInput } from 'tel-input-reka-ui'
import type { 
  TelInputProps, 
  TelInputEmits, 
  PhoneObject, 
  CountryObject,
  DropdownOptions,
  InputOptions 
} from 'tel-input-reka-ui'
```

### PhoneObject Interface

```typescript
interface PhoneObject {
  number: string;        // E.164 format (e.g., "+14155552671")
  isValid: boolean;      // Whether the number is valid
  country?: CountryObject;
  countryCode?: string;  // ISO2 country code
  nationalNumber?: string;
  formatted?: string;    // Formatted display number
}
```

### CountryObject Interface

```typescript
interface CountryObject {
  name: string;          // Country name
  iso2: CountryCode;     // ISO2 code (e.g., "US")
  dialCode: string;      // Dial code (e.g., "1")
  priority?: number;
  areaCode?: string[] | null;
}
```

## Usage Examples

### Basic Usage with v-model

```vue
<script setup>
import { ref } from 'vue'
import { TelInput } from 'tel-input-reka-ui'
import 'tel-input-reka-ui/style.css'

const phone = ref('')
</script>

<template>
  <TelInput v-model="phone" />
</template>
```

### Get E.164 Number

```vue
<script setup>
import { ref } from 'vue'
import { TelInput } from 'tel-input-reka-ui'
import 'tel-input-reka-ui/style.css'

const phone = ref('')
const e164 = ref('')

// e164 will be like "+14155552671"
</script>

<template>
  <TelInput v-model="phone" v-model:number="e164" />
</template>
```

### International Mode with Preferred Countries

```vue
<TelInput
  v-model="phone"
  mode="international"
  default-country="us"
  :preferred-countries="['us', 'gb', 'ca', 'au']"
  :dropdown-options="{ showSearchBox: true }"
/>
```

### Validation Handling

```vue
<script setup>
import { ref } from 'vue'
import { TelInput } from 'tel-input-reka-ui'
import 'tel-input-reka-ui/style.css'

const phone = ref('')
const isValid = ref(false)

function onValidate(phoneObject) {
  isValid.value = phoneObject.valid
  if (phoneObject.valid) {
    console.log('Valid number:', phoneObject.number)
  }
}
</script>

<template>
  <div>
    <TelInput v-model="phone" @validate="onValidate" />
    <p v-if="!isValid && phone">Please enter a valid phone number</p>
  </div>
</template>
```

### Custom Styling

The component uses Tailwind CSS with shadcn-vue CSS variables. You can customize by:

1. **Override CSS variables** in your global styles:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

2. **Pass custom classes** via `styleClasses` prop:

```vue
<TelInput
  style-classes="my-custom-wrapper"
  :input-options="{ styleClasses: 'my-custom-input' }"
/>
```

### Only Specific Countries

```vue
<TelInput
  v-model="phone"
  :only-countries="['us', 'ca', 'mx']"
/>
```

### Exclude Countries

```vue
<TelInput
  v-model="phone"
  :ignored-countries="['ru', 'cn']"
/>
```

### Disabled State

```vue
<TelInput v-model="phone" disabled />
```

### With Form Integration

```vue
<form @submit.prevent="submitForm">
  <TelInput
    v-model="phone"
    :input-options="{
      required: true,
      name: 'phone',
      id: 'phone-input'
    }"
    invalid-msg="Please enter a valid phone number"
    @validate="({ valid }) => isPhoneValid = valid"
  />
  <button type="submit" :disabled="!isPhoneValid">Submit</button>
</form>
```

## Global Registration

```typescript
// main.ts
import { createApp } from 'vue'
import TelInput from 'tel-input-reka-ui'
import 'tel-input-reka-ui/style.css'

const app = createApp(App)
app.use(TelInput)
app.mount('#app')
```

Then use anywhere without importing:

```vue
<template>
  <TelInput v-model="phone" />
</template>
```

## Credits

- Original [vue-tel-input](https://github.com/iamstevendao/vue-tel-input) by [@iamstevendao](https://github.com/iamstevendao)
- [Reka UI](https://reka-ui.com) for accessible primitives
- [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) for phone validation

## License

MIT
