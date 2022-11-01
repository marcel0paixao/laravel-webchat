import classNames from 'classnames';
import React from 'react';

export default function JetCheckbox(
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
) {
  return (
    <input
      type="checkbox"
      {...props}
      className={classNames(
        'rounded-[1px] border-TBL_TEXT_PLACEHOLDER border-2 text-TBL_SECONDARY shadow-sm focus:ring-opacity-50',
        props.className,
      )}
    />
  );
}
