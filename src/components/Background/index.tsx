import * as React from 'react';
import background from '../../assets/background.svg';
import styled from 'styled-components';

/******************************************************************************/
/* Background Component */
/******************************************************************************/

const Container = styled.div`
  min-width: 100%;
  min-height: 1000px;
  background-image: url(${(props: { bg: string }) => props.bg});
`;

export function Background(props: { children: React.ReactNode }) {
  return <Container bg={background}>{props.children}</Container>;
}
