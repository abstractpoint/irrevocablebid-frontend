import * as React from 'react';
import styled from 'styled-components';

const PIStyled = styled.div`
  margin: 20px auto;
  width: 50px;
  height: 40px;
  text-align: center;
  font-size: 10px;
  display: flex;
  gap: 4px;

  & > div {
    background-color: #fff;
    height: 100%;
    width: 6px;
    display: inline-block;

    -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
    animation: sk-stretchdelay 1.2s infinite ease-in-out;
  }
  @-webkit-keyframes sk-stretchdelay {
    0%,
    40%,
    100% {
      -webkit-transform: scaleY(0.4);
    }
    20% {
      -webkit-transform: scaleY(1);
    }
  }

  @keyframes sk-stretchdelay {
    0%,
    40%,
    100% {
      transform: scaleY(0.4);
      -webkit-transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
      -webkit-transform: scaleY(1);
    }
  }
`;
const Rect1 = styled.div``;
const Rect2 = styled.div`
  -webkit-animation-delay: -1.1s !important;
  animation-delay: -1.1s !important;
`;
const Rect3 = styled.div`
  -webkit-animation-delay: -1s !important;
  animation-delay: -1s !important;
`;
const Rect4 = styled.div`
  -webkit-animation-delay: -0.9s !important;
  animation-delay: -0.9s !important;
`;
const Rect5 = styled.div`
  -webkit-animation-delay: -0.8s !important;
  animation-delay: -0.8s !important;
`;

export const ProgressIndicator = () => {
  return (
    <PIStyled>
      <Rect1></Rect1>
      <Rect2></Rect2>
      <Rect3></Rect3>
      <Rect4></Rect4>
      <Rect5></Rect5>
    </PIStyled>
  );
};
