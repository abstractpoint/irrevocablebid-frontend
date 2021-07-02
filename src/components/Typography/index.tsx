import * as React from 'react';
import styled from 'styled-components';

interface TypographyProps {
  component?: string;
  variant?: string;
  align?: string;
  id?: string;
  children?: React.ReactNode;
}

export const Typography = (props: TypographyProps) => {
  const TypographyStyled = styled.h3`
    color: #ffffff;
  `;

  return <TypographyStyled>{props.children}</TypographyStyled>;
};

Typography.defaultProps = {
  component: 'p',
  align: 'left',
  variant: 'body1',
};
