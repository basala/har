import { gql, useMutation } from '@apollo/client';
import {
    Box,
    Button,
    Center,
    FormControl,
    FormLabel,
    Heading,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Link,
    Stack,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { FcLock, FcManager } from 'react-icons/fc';
import { useHistory } from 'react-router';
import Logo from '../../components/Logo/Logo';
import { ColorModeSwitcher } from '../../components/theme/ColorModeSwitcher';
import { GLOBAL_CST } from '../../config/global';

const CREATE_USER = gql`
    mutation createUser($input: CreateUserInput!) {
        createUser(input: $input) {
            username
        }
    }
`;

const LOGIN = gql`
    mutation login($input: LoginUserInput!) {
        login(input: $input) {
            token
            userId
            username
        }
    }
`;

const Login: FC = () => {
    const toast = useToast();
    const history = useHistory();

    const [createUser, { loading: createUserLoading }] = useMutation<
        {
            createUser: {
                username: string;
            };
        },
        {
            input: {
                username: string;
                password: string;
            };
        }
    >(CREATE_USER);
    const [login, { loading: loginLoading }] = useMutation<
        {
            login: {
                token: string;
                userId: string;
                username: string;
            };
        },
        {
            input: {
                username: string;
                password: string;
            };
        }
    >(LOGIN);

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [show, setShow] = React.useState(false);
    const [registerMode, setRegisterMode] = React.useState(false);

    const checkInputs = () => {
        if (!username) {
            toast({
                description: '用户名不能为空',
                status: 'error',
                position: 'top',
            });

            return false;
        }

        if (!password) {
            toast({
                description: '密码不能为空',
                status: 'error',
                position: 'top',
            });
            return false;
        }

        return true;
    };
    const registerHandler = async () => {
        if (!checkInputs()) {
            return;
        }

        const response = await createUser({
            variables: {
                input: {
                    username,
                    password,
                },
            },
        }).catch(err => {
            return {
                data: null,
                errors: [err],
            };
        });

        if (response.data) {
            toast({
                description: '注册成功，请登录',
                status: 'success',
                position: 'top',
            });
            setRegisterMode(false);
        }

        if (response.errors) {
            toast({
                description: '注册失败',
                status: 'error',
                position: 'top',
            });
        }
    };
    const loginHandler = async () => {
        if (!checkInputs()) {
            return;
        }

        const response = await login({
            variables: {
                input: {
                    username,
                    password,
                },
            },
        }).catch(err => {
            return {
                data: null,
                errors: [err],
            };
        });

        if (response.data) {
            localStorage.setItem(
                GLOBAL_CST.LOCAL_STORAGE.USER_ID,
                response.data.login.userId
            );
            localStorage.setItem(
                GLOBAL_CST.LOCAL_STORAGE.USER_NAME,
                response.data.login.username
            );
            localStorage.setItem(
                GLOBAL_CST.LOCAL_STORAGE.AUTH_TOKEN,
                response.data.login.token
            );
            toast({
                description: '登录成功',
                status: 'success',
                position: 'top',
            });
            history.push('/');
        } else if (response.errors) {
            toast({
                description: '用户名或密码错误',
                status: 'error',
                position: 'top',
            });
        }
    };

    return (
        <Center w="100vw" h="100vh">
            <Stack
                w="20vw"
                borderWidth={1}
                borderRadius={4}
                boxShadow="lg"
                padding={4}
            >
                <Box position="absolute" top="0" right="0" margin={4}>
                    <ColorModeSwitcher />
                </Box>
                <Center>
                    <Logo w="10rem" h="10rem" />
                </Center>
                <Heading
                    textAlign="center"
                    color={useColorModeValue('blackAlpha.600', 'light')}
                >
                    {registerMode ? 'Create an account' : 'Sign In to HarTest'}
                </Heading>

                <Stack py={8} px={4} spacing={4} textAlign="left">
                    <FormControl isRequired>
                        <FormLabel>UserName</FormLabel>
                        <InputGroup>
                            <InputLeftElement
                                children={<Icon as={FcManager} />}
                            />
                            <Input
                                placeholder="Please input your username"
                                onChange={event => {
                                    setUsername(event.target.value);
                                }}
                            />
                        </InputGroup>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                            <InputLeftElement children={<Icon as={FcLock} />} />
                            <Input
                                type={show ? 'text' : 'password'}
                                placeholder="Please input your password"
                                onChange={event => {
                                    setPassword(event.target.value);
                                }}
                            />
                            <InputRightElement
                                children={
                                    <Icon
                                        as={
                                            show
                                                ? AiFillEyeInvisible
                                                : AiFillEye
                                        }
                                        onClick={() => setShow(!show)}
                                        aria-label="toggle password"
                                        style={{ cursor: 'pointer' }}
                                    />
                                }
                            />
                        </InputGroup>
                    </FormControl>
                    <Box textAlign="right">
                        <Link
                            color="teal.500"
                            onClick={() => {
                                toast({
                                    description: 'Coming Soon...',
                                    status: 'info',
                                    position: 'top',
                                });
                            }}
                        >
                            Forgot your password?
                        </Link>
                    </Box>
                    <Button
                        onClick={registerMode ? registerHandler : loginHandler}
                        colorScheme="teal"
                        isFullWidth
                        type="submit"
                        isLoading={
                            registerMode ? createUserLoading : loginLoading
                        }
                    >
                        {registerMode ? 'Sign Up' : 'Sign In'}
                    </Button>
                </Stack>
                <Box textAlign="center">
                    <Link
                        color="teal.500"
                        onClick={() => {
                            setRegisterMode(!registerMode);
                        }}
                    >
                        {registerMode
                            ? 'Already have an account? Go to Sign in'
                            : 'New to? Create an account'}
                    </Link>
                </Box>
            </Stack>
        </Center>
    );
};

export default Login;
