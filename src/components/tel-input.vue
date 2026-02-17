<template>
  <div :class="[
    'flex items-center gap-0 rounded-md ring-offset-background',
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
    styleClasses,
    { 'opacity-50 cursor-not-allowed': disabled }
  ]">
    <ComboboxRoot
      v-model:open="data.open"
      v-model:searchTerm="data.searchQuery"
      :filter-function="filterCountries"
      class="relative"
    >
      <ComboboxAnchor
        :disabled="disabled || dropdownOptions.disabled"
        class="flex items-center gap-1 px-3 h-10 border border-r-0 rounded-l-md bg-background hover:bg-accent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="toggleDropdown"
      >
        <span
          v-if="dropdownOptions.showFlags"
          :class="['vti__flag', toLowerCase(data.activeCountryCode)]"
        ></span>
        <span v-if="dropdownOptions.showDialCodeInSelection" class="text-sm text-muted-foreground">
          +{{ activeCountry && activeCountry.dialCode }}
        </span>
        <ComboboxTrigger
          :aria-label="dropdownOptions.ariaLabel"
          :tabindex="dropdownOptions.tabindex"
          class="flex items-center"
          @click.stop
        >
          <slot name="arrow-icon" :open="data.open">
            <ChevronsUpDown class="h-4 w-4 text-muted-foreground" />
          </slot>
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent
        class="absolute z-50 mt-1 w-[300px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        :side-offset="4"
      >
        <ComboboxInput
          v-if="dropdownOptions.showSearchBox"
          :placeholder="dropdownOptions.searchBoxPlaceholder || 'Search country...'"
          class="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-b"
        />
        <ComboboxViewport class="max-h-[300px] overflow-y-auto p-1">
          <ComboboxEmpty class="py-6 text-center text-sm text-muted-foreground">
            No country found.
          </ComboboxEmpty>
          <ComboboxGroup v-if="preferredCountriesList.length">
            <ComboboxLabel class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Suggested
            </ComboboxLabel>
            <ComboboxItem
              v-for="pb in preferredCountriesList"
              :key="pb.iso2 + '-preferred'"
              :value="pb"
              @select="() => choose(pb)"
              class="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span
                v-if="dropdownOptions.showFlags"
                :class="['vti__flag', toLowerCase(pb.iso2)]"
              ></span>
              <span class="font-medium">{{ pb.name }}</span>
              <span v-if="dropdownOptions.showDialCodeInList" class="text-muted-foreground">
                +{{ pb.dialCode }}
              </span>
              <Check
                v-if="data.activeCountryCode === pb.iso2"
                class="ml-auto h-4 w-4"
              />
            </ComboboxItem>
          </ComboboxGroup>
          <ComboboxSeparator v-if="preferredCountriesList.length" class="-mx-1 my-1 h-px bg-border" />
          <ComboboxGroup>
            <ComboboxVirtualizer
              v-slot="{ option }"
              :options="filteredCountries"
              :text-content="(opt) => opt.name"
              :estimate-size="32"
            >
              <ComboboxItem
                :key="option.iso2"
                :value="option"
                @select="() => choose(option)"
                class="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <span
                  v-if="dropdownOptions.showFlags"
                  :class="['vti__flag', toLowerCase(option.iso2)]"
                ></span>
                <span class="font-medium">{{ option.name }}</span>
                <span v-if="dropdownOptions.showDialCodeInList" class="text-muted-foreground">
                  +{{ option.dialCode }}
                </span>
                <Check
                  v-if="data.activeCountryCode === option.iso2"
                  class="ml-auto h-4 w-4"
                />
              </ComboboxItem>
            </ComboboxVirtualizer>
          </ComboboxGroup>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxRoot>
    <input
      v-model="data.phone"
      ref="refInput"
      :type="inputOptions.type"
      :autocomplete="inputOptions.autocomplete"
      :autofocus="inputOptions.autofocus"
      :class="[
        'flex h-10 w-full rounded-r-md border border-l-0 border-input bg-background px-3 py-2 text-sm',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        inputOptions.styleClasses
      ]"
      :disabled="disabled"
      :id="inputOptions.id"
      :maxlength="inputOptions.maxlength"
      :name="inputOptions.name"
      :placeholder="data.parsedPlaceholder"
      :readonly="inputOptions.readonly"
      :required="inputOptions.required"
      :tabindex="inputOptions.tabindex"
      :value="modelValue"
      :aria-describedby="inputOptions['aria-describedby']"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @keyup.enter="onEnter"
      @keyup.space="onSpace"
    />
    <slot name="icon-right"></slot>
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import type { CountryCode, NumberFormat } from 'libphonenumber-js';
  import type { CountryObject, DropdownOptions, InputOptions, PhoneMeta } from '../types';

  import { parsePhoneNumber, loadStrictParser, isStrictParserReady, parseMin } from '../phone-parser';
  import { getDefault, setCaretPosition, getCountry, toLowerCase, toUpperCase } from '../utils';
  import { computed, nextTick, onMounted, reactive, shallowRef, watch, ref } from 'vue';

  import {
    ComboboxRoot,
    ComboboxAnchor,
    ComboboxTrigger,
    ComboboxContent,
    ComboboxInput,
    ComboboxViewport,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxItem,
    ComboboxSeparator,
    ComboboxVirtualizer,
  } from 'reka-ui';
  import { Check, ChevronsUpDown } from 'lucide-vue-next';

  const refInput = shallowRef<HTMLInputElement>()

  // let examples = null;
  // const getExamples = () => new Promise(
  //   (resolve) => (
  //     examples
  //       ? resolve(examples)
  //       : import('libphonenumber-js/examples.mobile.json')
  //         .then((results) => {
  //           examples = results;
  //           resolve(results);
  //         })
  //   ),
  // );

  defineOptions({
    name: 'TelInput',
  })

  const emit = defineEmits([
    'blur',
    'close',
    'country-changed',
    'enter',
    'focus',
    'on-input',
    'open',
    'space',
    'update:number',
    'validate',
  ])
  const props = defineProps({
    allCountries: {
      type: Array as PropType<CountryObject[]>,
      default: () => getDefault('allCountries') as CountryObject[],
    },
    autoFormat: {
      type: Boolean,
      default: () => getDefault('autoFormat') as boolean,
    },
    customValidate: {
      type: [Boolean, RegExp],
      default: () => getDefault('customValidate') as boolean,
    },
    defaultCountry: {
      // Default country code, ie: 'AU'
      // Will override the current country of user
      type: [String, Number],
      default: () => getDefault('defaultCountry') as string,
    },
    disabled: {
      type: Boolean,
      default: () => getDefault('disabled') as boolean,
    },
    autoDefaultCountry: {
      type: Boolean,
      default: () => getDefault('autoDefaultCountry') as boolean,
    },
    dropdownOptions: {
      type: Object as PropType<DropdownOptions>,
      default: () => getDefault('dropdownOptions') as DropdownOptions,
    },
    ignoredCountries: {
      type: Array as PropType<string[]>,
      default: () => getDefault('ignoredCountries') as never[],
    },
    inputOptions: {
      type: Object as PropType<InputOptions>,
      default: () => getDefault('inputOptions') as InputOptions,
    },
    invalidMsg: {
      type: String,
      default: () => getDefault('invalidMsg') as string,
    },
    mode: {
      type: String as PropType<'auto' | Lowercase<NumberFormat>>,
      default: () => getDefault('mode') as 'auto',
    },
    onlyCountries: {
      type: Array as PropType<string[]>,
      default: () => getDefault('onlyCountries') as never[],
    },
    preferredCountries: {
      type: Array as PropType<string[]>,
      default: () => getDefault('preferredCountries') as never[],
    },
    validCharactersOnly: {
      type: Boolean,
      default: () => getDefault('validCharactersOnly') as boolean,
    },
    styleClasses: {
      type: [String, Array, Object],
      default: () => getDefault('styleClasses') as string,
    },
    strictValidation: {
      type: Boolean,
      default: () => getDefault('strictValidation') as boolean,
    },
  })

  // Track when strict parser is loaded for re-validation
  const strictParserReady = ref(isStrictParserReady())

  const modelValue = defineModel({ type: String })
  watch(modelValue, (value, oldValue) => {
    if (!testCharacters()) {
      nextTick(() => {
        data.phone = oldValue ?? '';
        onInput();
      });
    } else {
      data.phone = value ?? '';
    }
  })

  const data = reactive({
    phone: '',
    activeCountryCode: undefined as CountryCode | undefined,
    open: false,
    finishMounted: false,
    parsedPlaceholder: props.inputOptions.placeholder,
    searchQuery: '',
  })
  watch(() => data.open, (isDropdownOpened) => {
    // Emit open and close events
    if (isDropdownOpened) {
      emit('open');
    } else {
      emit('close');
    }
  })

  const filteredCountries = computed(() => {
    // List countries after filtered
    if (props.onlyCountries.length) {
      return props.allCountries
        .filter(({ iso2 }) => props.onlyCountries.some((c) => toUpperCase(c) === iso2));
    }

    if (props.ignoredCountries.length) {
      return props.allCountries.filter(
        ({ iso2 }) => !props.ignoredCountries.includes(toUpperCase(iso2))
          && !props.ignoredCountries.includes(toLowerCase(iso2)),
      );
    }

    return props.allCountries;
  })

  const activeCountry = computed(() => findCountry(data.activeCountryCode))
  watch(activeCountry, (value, oldValue) => {
    if (!value && oldValue?.iso2) {
      data.activeCountryCode = oldValue.iso2;
      return;
    }
    if (value?.iso2) {
      emit('country-changed', value);
      // resetPlaceholder();
    }
  })

  const parsedMode = computed<Lowercase<NumberFormat>>(() => {
    const mode = toLowerCase(props.mode)
    if (mode === 'auto') {
      if (!data.phone?.startsWith('+')) {
        return 'national';
      }
      return 'international';
    }
    if (!['national', 'international', 'e.164', 'rfc3966', 'idd'].includes(mode)) {
      console.error('Invalid value of prop "mode"');
      return 'international';
    }
    return mode;
  })

  const preferredCountriesList = computed(() => {
    return getCountries(props.preferredCountries);
  })

  // Filter function for Command component
  function filterCountries(list: CountryObject[], searchTerm: string) {
    const cleanInput = searchTerm.toLowerCase().replace(/[~`!@#$%^&*()+={}\[\];:\'\"<>.,\/\\\?-_]/g, '');
    if (!cleanInput) return list;
    return list.filter(
      (c) => (new RegExp(cleanInput, 'i')).test(c.name)
        || (new RegExp(cleanInput, 'i')).test(c.iso2)
        || (new RegExp(cleanInput, 'i')).test(c.dialCode),
    );
  }

  const phoneObject = computed(() => {
    // Reactive dependency: triggers re-computation when strict parser loads
    void strictParserReady.value;

    const result = data.phone.startsWith('+')
      ? parsePhoneNumber(data.phone, undefined, props.strictValidation)
      : parsePhoneNumber(data.phone, data.activeCountryCode, props.strictValidation);

    const meta: PhoneMeta = {
      country: result?.country,
      countryCode: result?.country,
      formatted: data.phone,
      valid: result?.isValid(),
      possible: result?.isPossible?.(),
      nationalNumber: result?.nationalNumber,
    }

    if (meta.valid) {
      meta.formatted = result?.format(toUpperCase(parsedMode.value));
    }

    if (result?.country
      && (props.ignoredCountries.length || props.onlyCountries.length)
      && !findCountry(result.country)) {
      meta.valid = false;
      meta.possible = false;
      result.country = null;
    }

    if (!result) {
      return meta
    }

    return {
      ...meta,
      ...result,
    }
  })
  watch(() => phoneObject.value.countryCode, (value) => {
    if (value) {
      data.activeCountryCode = value;
    }
  })
  watch(() => phoneObject.value.valid, () => {
    emit('validate', phoneObject.value);
  })
  watch(() => (phoneObject.value as any).number, (value) => {
    emit('update:number', value);
  })
  watch(() => phoneObject.value.formatted, (value) => {
    if (!props.autoFormat || props.customValidate) {
      return;
    }
    emitInput(value);

    nextTick(() => {
      // In case `v-model` is not set, we need to update the `phone` to be new formatted value
      if (value && !modelValue.value) {
        data.phone = value;
      }
    });
  })

  // finishMounted() {
  //   resetPlaceholder();
  // },

  watch(() => props.inputOptions.placeholder, resetPlaceholder)

  onMounted(() => {
    if (props.strictValidation && !isStrictParserReady()) {
      loadStrictParser().then(() => {
        strictParserReady.value = true;
        emit('validate', phoneObject.value);
      });
    }

    if (modelValue.value) {
      data.phone = modelValue.value.trim();
    }

    cleanInvalidCharacters();

    initializeCountry()
      .then(() => {
        if (!data.phone && data.activeCountryCode) {
          const country = findCountry(data.activeCountryCode);
          if (country && (props.inputOptions?.showDialCode || props.mode === 'international')) {
            data.phone = `+${country.dialCode}`;
          }
        }
        emit('validate', phoneObject.value);
      })
      .catch(console.error)
      .then(() => {
        data.finishMounted = true;
      });
  })

  function resetPlaceholder() {
    data.parsedPlaceholder = props.inputOptions.placeholder;
    // TODO: Fix dynamicPlaceholder
    // if (!props.inputOptions.dynamicPlaceholder) {
    //   return result;
    // }
    // getExamples()
    //   .then((results) => {
    //     examples = results;
    //     const mode = (!props.mode || props.mode === 'auto') ? 'international' : props.mode;
    //     const number = getExampleNumber(data.activeCountryCode.toUpperCase(), results);
    //     data.parsedPlaceholder = number?.format(mode.toUpperCase()) || this.placeholder;
    //   })
    //   .catch(console.error);
  }
  function initializeCountry(): Promise<void> {
    return new Promise((resolve) => {
      /**
       * 1. If the phone included prefix (i.e. +12), try to get the country and set it
       */
      if (data.phone?.[0] === '+') {
        resolve();
        return;
      }
      /**
       * 2. Use default country if passed from parent
       */
      if (props.defaultCountry) {
        if (typeof props.defaultCountry === 'string') {
          choose(props.defaultCountry);
          resolve();
          return;
        }
        if (typeof props.defaultCountry === 'number') {
          const country = findCountryByDialCode(props.defaultCountry);
          if (country) {
            choose(country.iso2);
            resolve();
            return;
          }
        }
      }

      const fallbackCountry = props.preferredCountries[0] || filteredCountries.value[0];
      /**
       * 3. Check if fetching country based on user's IP is allowed, set it as the default country
       */
      if (props.autoDefaultCountry) {
        getCountry()
          .then((res) => {
            choose(res || data.activeCountryCode);
          })
          .catch((error) => {
            console.warn(error);
            /**
             * 4. Use the first country from preferred list (if available) or all countries list
             */
            choose(fallbackCountry);
          })
          .then(() => {
            resolve();
          });
      } else {
        /**
         * 4. Use the first country from preferred list (if available) or all countries list
         */
        choose(fallbackCountry);
        resolve();
      }
    });
  }
  /**
   * Get the list of countries from the list of iso2 code
   */
  function getCountries(list: string[] = []) {
    return list
      .map(findCountry)
      .filter(Boolean);
  }
  function findCountry(iso = '') {
    return filteredCountries.value.find((country) => country.iso2 === toUpperCase(iso));
  }
  function findCountryByDialCode(dialCode: number) {
    return filteredCountries.value.find((country) => Number(country.dialCode) === dialCode);
  }
  function choose(country: string | CountryObject) {
    data.open = false;
    const parsedCountry: CountryObject | undefined = typeof country === 'string'
      ? findCountry(country)
      : country;

    if (!parsedCountry) {
      return;
    }

    if (data.phone?.[0] === '+'
      && parsedCountry.iso2
      && phoneObject.value.nationalNumber) {
      data.activeCountryCode = parsedCountry.iso2;
      // Attach the current phone number with the newly selected country
      data.phone = parseMin(
        phoneObject.value.nationalNumber,
        parsedCountry.iso2,
      )
        ?.formatInternational() ?? '';
      return;
    }

    if ((props.inputOptions?.showDialCode || props.mode === 'international') && parsedCountry) {
      // Reset phone if the showDialCode is set or mode is international
      data.phone = `+${parsedCountry.dialCode}`;
      data.activeCountryCode = parsedCountry.iso2;
      return;
    }

    // update value, even if international mode is NOT used
    data.activeCountryCode = parsedCountry.iso2;
    emitInput(data.phone);
  }
  function cleanInvalidCharacters() {
    const currentPhone = data.phone;
    if (props.validCharactersOnly) {
      const results = data.phone.match(/[()\-+0-9\s]*/g);
      data.phone = results.join('');
    }

    if (props.customValidate && props.customValidate instanceof RegExp) {
      const results = data.phone.match(props.customValidate);
      data.phone = results.join('');
    }

    if (currentPhone !== data.phone) {
      emitInput(data.phone);
    }
  }
  function testCharacters() {
    if (props.validCharactersOnly) {
      const result = /^[()\-+0-9\s]*$/.test(data.phone);
      if (!result) {
        return false;
      }
    }
    if (props.customValidate) {
      return testCustomValidate();
    }
    return true;
  }
  function testCustomValidate() {
    return props.customValidate instanceof RegExp ? props.customValidate.test(data.phone) : false;
  }
  function onInput() {
    refInput.value?.setCustomValidity(phoneObject.value.valid ? '' : props.invalidMsg);
    // Returns response.number to assign it to v-model (if being used)
    // Returns full response for cases @input is used
    // and parent wants to return the whole response.
    emitInput(data.phone);
  }
  function emitInput(value: string) {
    // emit('update:modelValue', value);
    modelValue.value = value;

    emit('on-input', value, phoneObject.value, refInput.value);
  }
  function onBlur(e: FocusEvent) {
    emit('blur', e);
  }
  function onFocus(e: FocusEvent) {
    setCaretPosition(refInput.value, data.phone.length);
    emit('focus', e);
  }
  function onEnter(e: KeyboardEvent) {
    emit('enter', e);
  }
  function onSpace(e: KeyboardEvent) {
    emit('space', e);
  }
  function toggleDropdown() {
    if (props.disabled || props.dropdownOptions?.disabled) {
      return;
    }
    data.searchQuery = '';
    data.open = !data.open;
  }
  function focus() {
    refInput.value?.focus();
  }
  function blur() {
    refInput.value?.blur();
  }
  defineExpose({
    focus,
    blur,
  })
</script>

<style src="../assets/sprite.css"></style>
