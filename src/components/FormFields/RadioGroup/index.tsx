import * as React from 'react';
import styled from 'styled-components';

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
    height: 16px;
    width: 16px;
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
