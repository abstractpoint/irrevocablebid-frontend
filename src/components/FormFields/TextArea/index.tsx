import * as React from 'react';
import styled from 'styled-components';

type TextAreaProps = {
  rows?: number;
  onChange: (event: any) => void;
  style?: object;
};

const TextAreaStyled = styled.textarea`
  border: 2px solid #ffffff;
  border-radius: 10px;
  padding: 6px 14px;
  color: #ffffff;
  font-family: 'Oxygen', sans-serif;
  width: 100%;
  background: rgba(196, 196, 196, 0.38);
  font-size: 16px;
  resize: none;
`;

export const TextArea = (props: TextAreaProps) => {
  return <TextAreaStyled onChange={props.onChange} rows={props.rows} />;
};
