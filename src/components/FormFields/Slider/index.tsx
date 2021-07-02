import * as React from 'react';
import { default as SliderLib } from 'react-input-slider';
import styled from 'styled-components';

type SliderProps = {
  defaultValue: number;
  step: number;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

const WrapperStyled = styled.div`
  position: relative;
  height: 60px;
  border: solid 2px #ffffff;

  border-radius: 10px;
  width: 300px;
  display: flex;
  justify-content: flex-end;
`;

const SliderStyled = styled.div<{ width: number }>`
  height: 100%;
  border-radius: 10px;
  background-color: var(--action-orange);
  width: ${({ width }) => width}%;
`;

const ValueStyled = styled.span`
  position: absolute;
  top: 27%;
  right: 30px;
  color: white;
  font-size: 22px;
  z-index: 3;
`;

export const Slider = (props: SliderProps) => {
  return (
    <WrapperStyled>
      <ValueStyled>{props.value}%</ValueStyled>
      <SliderLib
        axis="x"
        styles={{
          track: {
            height: '56px',
            borderRadius: '10px',
            width: '100%',
            backgroundColor: 'transparent',
          },
          active: {
            backgroundColor: 'var(--action-orange)',
            height: '100%',
            borderRadius: '10px',
          },
          thumb: {
            width: '3px',
            height: '33px',
            opacity: 0.8,
            borderRadius: '10px',
            zIndex: 5,
          },
        }}
        xmin={props.min}
        xmax={props.max}
        xstep={props.step}
        x={props.value}
        onChange={({ x }) => props.onChange(x)}
      />
    </WrapperStyled>
  );
};
