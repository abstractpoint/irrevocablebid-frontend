import * as React from 'react';
import styled from 'styled-components';

interface TypographyProps {
  component?: string;
  variant?: string;
  align?: string;
  id?: string;
  children?: React.ReactNode;
}

const TypographyStyled = styled.h3`
  color: #ffffff;
  font-family: 'Oxygen', sans-serif;
`;

export const Typography = (props: TypographyProps) => {
  return <TypographyStyled>{props.children}</TypographyStyled>;
};

Typography.defaultProps = {
  component: 'p',
  align: 'left',
  variant: 'body1',
};
