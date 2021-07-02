import styled from 'styled-components';

export const Container = styled.div`
  min-width: 100%;
  min-height: 1000px;
  background-image: url(${(props: { bg: string }) => props.bg});
`;
