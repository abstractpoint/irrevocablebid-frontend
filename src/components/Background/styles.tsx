import styled from 'styled-components';

export const Container = styled.div`
  padding-bottom: 400px;
  background-image: url(${(props: { bg: string }) => props.bg});
`;
