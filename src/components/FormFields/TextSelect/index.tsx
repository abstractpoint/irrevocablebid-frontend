import * as React from 'react';
import styled, { css } from 'styled-components';
import Select from 'react-select';
import { TextField } from '../TextField';

type SelectItem = {
  value: string;
  label: string;
};

type TextSelectProps = {
  name: string;
  selectName: string;
  selectOptions: SelectItem[];
  onChange: (event: any) => void;
  selectOnChange: (value: string) => void;
  selectDefaultValue: SelectItem;
};

const WrapperStyled = styled.div`
  display: flex;
`;

const selectStyles = {
  container: (provided: any) => ({
    ...provided,
    width: '96px',
    backgroundColor: 'var(--dark-purple)',
    borderRadius: '10px',
    border: 'solid 2px #ffffff',
    cursor: 'pointer',
    '&:focus': {
      outline: 'none',
      border: 'none',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--dark-purple)',
    border: 'solid 2px white',
    borderRadius: '10px',
    color: '#ffffff',
    padding: '7px;',
    zIndex: '4',
  }),
  MenuList: (provided: any) => ({
    ...provided,
    padding: '0px;',
    zIndex: '4',
  }),
  indicatorContainer: (provided: any) => ({
    ...provided,
    color: '#ffffff',
    cursor: 'pointer',
    '&:hover': {
      color: '#ffffff',
    },
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: 'none',
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--dark-purple)',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#ffffff',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '2px',
    backgroundColor: state.isSelected
      ? 'rgba(196,196,196,0.38)'
      : 'var(--dark-purple)',
    '&:hover': {
      backgroundColor: 'rgba(196,196,196,0.38)',
    },
  }),
};

const SelectWrapper = styled.div`
  margin-left: 12px;
`;

const textFieldStyles = css``;

export const TextSelect = (props: TextSelectProps) => {
  return (
    <WrapperStyled>
      <TextField
        name={props.name}
        onChange={props.onChange}
        styles={textFieldStyles}
      />
      <SelectWrapper>
        <Select
          options={props.selectOptions}
          styles={selectStyles}
          defaultValue={props.selectDefaultValue}
          onChange={(selected: any) => props.selectOnChange(selected.value)}
        />
      </SelectWrapper>
    </WrapperStyled>
  );
};
