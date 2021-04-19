import { chakra, ChakraProps } from '@chakra-ui/react';
import { FC } from 'react';
import logo from './cat.svg';

type LogoProps = ChakraProps;

const Logo: FC<LogoProps> = props => {
    return <chakra.img src={logo} {...props} />;
};

export default Logo;
