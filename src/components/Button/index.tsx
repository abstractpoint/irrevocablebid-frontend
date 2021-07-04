import * as React from 'react';
import styled from 'styled-components';

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: string;
  size?: string;
  color?: string;
  style?: object;
};

const Primary = styled.button`
  width: 100%;
  padding: 16px 28px;
  background: var(--action-orange);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  border: none;
  font-family: Oxygen;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  cursor: pointer;
  &:hover {
    transform: translate3d(2px, 2px, 0px);
  }
`;

export const Button = (props: ButtonProps) => {
  let Component = Primary;
  let style = {
    ...props.style,
  };
  if (props.variant === 'text') {
    style = {
      ...style,
      background: 'transparent',
      textColor: 'var(--action-orange)',
    };
  }
  if (props.disabled) {
    style = {
      ...style,
      backgroundColor: 'var(--cancel-gray)',
    };
  }
  if (props.size === 'small') {
    style = {
      ...style,
      padding: '6px 12px',
      width: 'auto',
      fontSize: '14px',
      borderRadius: '6px',
    };
  }
  return (
    <Component style={style} disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </Component>
  );
};

Button.defaultProps = {
  disabled: false,
  style: {},
};
