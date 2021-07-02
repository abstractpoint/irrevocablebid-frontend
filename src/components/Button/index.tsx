import * as React from 'react';
import styled from 'styled-components';

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

const ButtonStyled = styled.button`
  width: 100%;
  padding: 18px;

  background: var(--action-orange);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 14px;
  border: none;
  font-family: Oxygen;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  cursor: pointer;
`;

export const Button = (props: ButtonProps) => {
  return (
    <ButtonStyled disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </ButtonStyled>
  );
};

Button.defaultProps = {
  disabled: false,
};
