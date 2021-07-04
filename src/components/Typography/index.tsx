import * as React from 'react';
import styled, { css } from 'styled-components';
import { OpenInNew } from '@material-ui/icons';

interface TypographyProps {
  variant?: string;
  align?: string;
  id?: string;
  children?: React.ReactNode;
  style?: object;
  href?: string;
  target?: string;
  subVariant?: string;
}

const shared = css`
  font-family: 'Oxygen', sans-serif;
`;

const H1Styled = styled.h1`
  ${shared}
  color: #ffffff;
`;
const H3Styled = styled.h3`
  ${shared}
  color: #ffffff;
`;
const H4Styled = styled.h4`
  ${shared}
  color: #ffffff;
`;
const PStyled = styled.p`
  ${shared}
  color: #ffffff;
  font-weight: 300;
`;
const AStyled = styled.a`
  ${shared}
  color: #ffffff;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
`;
const ErrorStyled = styled.h5`
  ${shared}
  color: var(--error-red);
`;

export const Typography = (props: TypographyProps) => {
  let Component = H3Styled;
  let style = {
    ...props.style,
  };
  if (props.subVariant === 'listHeading') {
    style = {
      ...style,
      marginBottom: '10px',
    };
  } else if (props.subVariant === 'listItemHeading') {
    style = {
      ...style,
      marginRight: '12px',
    };
  }

  if (props.variant === 'h1') {
    Component = H1Styled;
  } else if (props.variant === 'h4') {
    Component = H4Styled;
  } else if (props.variant === 'p') {
    Component = PStyled;
  } else if (props.variant === 'error') {
    Component = ErrorStyled;
  } else if (props.variant === 'a') {
    return (
      <AStyled href={props.href} target={props.target} style={style}>
        {props.children}
        {props.target === '_blank' && <OpenInNew />}
      </AStyled>
    );
  }
  return <Component style={style}>{props.children}</Component>;
};

Typography.defaultProps = {
  align: 'left',
  variant: 'body1',
  style: {},
};
