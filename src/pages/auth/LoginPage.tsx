import { endpoint } from "@/api/endpoint";
import type { ITokenResponse } from "@/api/types/auth";
import { useAppDispatch } from "@/hooks/hooks";
import authSlice from "@/store/authSlice";
import { Button, Card, Form, Input, App, Tabs } from "antd";
import useAxios from "axios-hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";


export const LoginPage = () => {

    const nav = useNavigate();
    const dispatch = useAppDispatch();
    const {message:msg} = App.useApp();
    const msgLoadingKey = 'login-loading';
    const [{ data, loading, error, response }, execLogin] = useAxios<ITokenResponse>(
        { ...endpoint.postLogin('', '') }, { manual: true }
    );
    const onFinish = (values: { username: string, password: string }) => {
        execLogin({ ...endpoint.postLogin(values.username, values.password) });
        msg.open({
            type: 'loading',
            duration: 0,
            content: '登录中, 请稍等...',
            key: msgLoadingKey,
        });
    }

    useEffect(() => {
        if (loading) {
            return;
        }

        if (error) {
            console.error(`Error occurred at login: ${error.message}`);
            if (error.message.includes('401') || error.message.includes('400')) {
                msg.open({
                    content: '用户名或密码错误',
                    duration: 2,
                    type: 'error',
                    key: msgLoadingKey,
                });
            } else {
                msg.open({
                    content: '登录失败，请稍后重试',
                    duration: 2,
                    type: 'error',
                    key: msgLoadingKey,
                });
            }
            return;
        }
        msg.destroy(msgLoadingKey);
        if (!data) {
            return;
        }
        dispatch(authSlice.actions.login({
            accessToken: data.access_token
        }));
        nav('/');

    }, [data, error, loading, response, dispatch]);

    return <Card style={{ width: 400 }} styles={{
        root: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }
    }} >
        <Tabs
            centered
            activeKey={location.pathname}
            onChange={(key) => nav(key)}
            items={[
                { key: '/auth/login', label: '登录' },
                { key: '/auth/register', label: '注册' },
            ]}
        />
        <Form layout="horizontal"
            requiredMark={false}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            onFinish={onFinish}>
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码长度至少为6位' }]}>
                <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
                登录
            </Button>
        </Form>
    </Card>
}