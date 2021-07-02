import * as React from 'react';
import styled from 'styled-components';

/******************************************************************************/
/* TextField */
/******************************************************************************/

type TextFieldProps = {
  name: string;
  onChange: (event: any) => void;
  type?: string;
  defaultValue?: string;
  min?: string;
};

const TextFieldStyled = styled.input`
  border: 2px solid #ffffff;
  border-radius: 10px;
  padding: 8px 14px;
  color: #ffffff;
  font-family: 'Oxygen', sans-serif;
  width: 100%;
  background: rgba(196, 196, 196, 0.38);
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
      />
    </div>
  );
};

TextField.defaultProps = {
  type: 'text',
};

type FieldLabelProps = {
  children: React.ReactNode;
  for: string;
  label: string;
};

/******************************************************************************/
/* FieldLabel */
/******************************************************************************/

const WrapperStyled = styled.div`
  display: flex;
  margin-bottom: 12px;
  flex-direction: column;
`;

const LabelStyled = styled.label`
  font-family: 'Oxygen', sans-serif;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 25px;
  margin-bottom: 8px;
  color: #ffffff;
`;

export const FieldLabel = (props: FieldLabelProps) => {
  return (
    <WrapperStyled>
      <LabelStyled htmlFor={props.for}>{props.label}</LabelStyled>
      {props.children}
    </WrapperStyled>
  );
};

/******************************************************************************/
/* RadioGroup */
/******************************************************************************/

type RadioType = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  values: RadioType[];
  value: string;
  onChange: (event: any) => void;
  name: string;
};

const RadioStyled = styled.input`
  display: none;
`;

const RadioLabelStyled = styled.label<{ active: boolean }>`
  font-family: 'Oxygen', sans-serif;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  display: block;
  padding: 8px;
  cursor: pointer;
  color: #FFFFFF;
  &::before {
    content: '';
    display: inline-block;
    vertical-align: -4px;
    height: 1em;
    width: 1em;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.5);
    margin-right: 8px;
  }

  ${({ active }) =>
    active &&
    `
    &::before {
      border-color: var(--action-orange);
      background-image: radial-gradient(
        circle closest-side,
        var(--action-orange) 0%,
        var(--action-orange) 50%,
        transparent 50%,
        transparent 100%
      );
    }
  `}
  }
`;

const RadioGroupStyled = styled.div`
  display: flex;
`;

export const RadioGroup = (props: RadioGroupProps) => {
  return (
    <RadioGroupStyled>
      {props.values.map((item: RadioType) => {
        return (
          <div key={item.value}>
            <RadioStyled
              id={item.value}
              type="radio"
              name={props.name}
              value={item.value}
              checked={props.value === item.value}
              onChange={props.onChange}
            />
            <RadioLabelStyled
              htmlFor={item.value}
              active={props.value === item.value}
            >
              {item.label}
            </RadioLabelStyled>
          </div>
        );
      })}
    </RadioGroupStyled>
  );
};
