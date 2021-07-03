import * as React from 'react';
import styled, { ThemedCssFunction, DefaultTheme } from 'styled-components';

/******************************************************************************/
/* TextField */
/******************************************************************************/

type TextFieldProps = {
  name: string;
  onChange: (event: any) => void;
  type?: string;
  defaultValue?: string;
  min?: string;
  styles?: any;
};

// background-image: url(${(props: { bg: string }) => props.bg});
const TextFieldStyled = styled.input<{
  styles: any;
}>`
  ${(props) => props.styles}
  border: 2px solid #ffffff;
  border-radius: 10px;
  padding: 6px 14px;
  color: #ffffff;
  font-family: 'Oxygen', sans-serif;
  width: 100%;
  background: rgba(196, 196, 196, 0.38);
  font-size: 19px;
`;

export const TextField = (props: TextFieldProps) => {
  return (
    <div>
      <TextFieldStyled
        type={props.type}
        defaultValue={props.defaultValue}
        name={props.name}
        onChange={props.onChange}
        min={props.min}
        styles={props.styles}
      />
    </div>
  );
};

TextField.defaultProps = {
  type: 'text',
};
