import { endpoint } from "@/api/endpoint";
import type { APIAuthRole, ITokenResponse } from "@/api/types/auth";
import { useAppDispatch } from "@/hooks/hooks";
import { App, Button, Card, Form, Input, Select, Tabs } from "antd";
import type { RuleRender } from "antd/es/form";
import useAxios from "axios-hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";


export const RegisterPage = () => {

    const nav = useNavigate();
    const dispatch = useAppDispatch();
    const {message:msg} = App.useApp();
    const msgLoadingKey = 'register-loading';
    const [{ data, loading, error, response }, execLogin] = useAxios<ITokenResponse>(
        { ...endpoint.postRegister('', '', 'MERCHANT') }, { manual: true }
    );
    const onFinish = (values: { username: string, password: string, role: APIAuthRole }) => {
        execLogin({ ...endpoint.postRegister(values.username, values.password, values.role) });
        msg.open({
            type: 'loading',
            duration: 0,
            content: '注册中，请稍等...',
            key: msgLoadingKey,
        });
    };

    useEffect(() => {
        if (loading) {
            return;
        }

        if (error) {
            console.error(`Error occurred at register: ${error.message}`);
            if (error.message.includes('401') || error.message.includes('400')) {
                msg.open({
                    content: '注册字段有误，请再次检查',
                    duration: 2,
                    type: 'error',
                    key: msgLoadingKey,
                });
            } else {
                msg.open({
                    content: '注册失败，请稍后重试',
                    duration: 2,
                    type: 'error',
                    key: msgLoadingKey,
                });
            }
            return;
        }
        if (!data) {
            return;
        }
        msg.open({
            content: '注册成功, 请重新登录',
            duration: 2,
            type: 'success',
            key: msgLoadingKey,
        });

        nav('/');

    }, [data, error, loading, response, dispatch]);

    const confirmPasswordValidator: RuleRender = ({ getFieldValue }) => ({
        validator(_: unknown, value: string) {
            if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('两次密码不一致'));
        },
    });

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
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}>
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码长度至少为6位' }]}>
                <Input.Password />
            </Form.Item>
            <Form.Item label="请重复密码" name="confirmPassword" dependencies={['password']} rules={[
                { required: true, message: '请再次输入密码' },
                confirmPasswordValidator,
            ]}>
                <Input.Password />
            </Form.Item>
            <Form.Item label="账户类型" name="role" rules={[{ required: true, message: '请选择注册账号的类型' }]}>
                <Select options={[
                    { value: 'MERCHANT', label: '商户' },
                    { value: 'ADMIN', label: '管理员' },
                ]}
                />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
                注册
            </Button>
        </Form>
    </Card>
}