import * as React from 'react';
import styled from 'styled-components';

/******************************************************************************/
/* FieldLabel */
/******************************************************************************/

type FieldLabelProps = {
  children: React.ReactNode;
  for?: string;
  label: string;
};

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
