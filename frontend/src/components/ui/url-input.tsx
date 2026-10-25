import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ClipboardEvent,
} from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from './input-group';
import { DEFAULT_SCHEME, stripUrlScheme, joinUrlScheme, type UrlScheme } from './url-scheme';

export interface UrlInputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'type'> {
  /** Full URL including scheme — what forms store and submit. */
  value: string;
  onChange: (fullUrl: string) => void;
  /** Visible prefix. Default `https://`. */
  scheme?: UrlScheme;
}

/**
 * URL field with a fixed scheme prefix (`https://` by default).
 *
 * Built on `InputGroup` — the prefix is an addon, the editable part is
 * host + path. `value` / `onChange` always speak full URLs so callers don't
 * reassemble the scheme. Pasting a full URL strips the scheme into the field.
 *
 * Pair with `Field` like any other control; `InputGroup` forwards `id` /
 * `aria-invalid` to the inner input.
 */
export const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(function UrlInput(
  {
    value,
    onChange,
    scheme = DEFAULT_SCHEME,
    placeholder = 'api.example.com/v1',
    onPaste,
    className,
    ...props
  },
  ref,
) {
  const hostPath = stripUrlScheme(value);

  function commit(nextHostPath: string) {
    onChange(joinUrlScheme(nextHostPath, scheme));
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text');
    if (/^https?:\/\//i.test(text.trim())) {
      event.preventDefault();
      commit(stripUrlScheme(text));
    }
    onPaste?.(event);
  }

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <InputGroupText>{scheme}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        type="url"
        inputMode="url"
        autoComplete="url"
        spellCheck={false}
        placeholder={placeholder}
        value={hostPath}
        onChange={(event) => commit(event.target.value)}
        onPaste={handlePaste}
        {...props}
      />
    </InputGroup>
  );
});
