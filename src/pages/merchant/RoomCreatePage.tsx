import { App, Breadcrumb, Button, Form, Popconfirm, Space } from 'antd';
import styles from './RoomCreatePage.module.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { RoomEditForm } from '@/components/RoomEditForm';
import useAxios from 'axios-hooks';
import { endpoint } from '@/api/endpoint';
import { useHotels } from '@/hooks/merchant';
import { useNavigate, useParams } from 'react-router';
import type { IRoomCreateRequest } from '@/api/types/room';

export function RoomCreatePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { message: msg } = App.useApp();
    const { getHotel } = useHotels();
    const hotel = getHotel(Number(id));

    const [{ loading: submitLoading }, execCreate] = useAxios<any, FormData | IRoomCreateRequest>(
        '', { manual: true }
    );

    const onFinish = async (data: FormData | IRoomCreateRequest) => {
        try {
            const curConfig = endpoint.postCreateRoom(Number(id), data);
            if (data instanceof FormData) {
                await execCreate({
                    ...curConfig,
                    headers: { ...curConfig.headers, 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await execCreate({ ...curConfig });
            }
            msg.success('创建成功');
            navigate(`/merchant/hotel/${id}/rooms`);
        } catch (e: any) {
            msg.error(e?.message ?? '创建失败');
        }
    };

    const onBack = () => navigate(`/merchant/hotel/${id}/rooms`);

    return (
        <div className={styles.container}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[
                    { title: <a onClick={() => navigate('/merchant/hotels')}>酒店信息管理</a> },
                    { title: <a onClick={() => navigate(`/merchant/hotel/${id}`)}>{hotel?.nameCn ?? '酒店详情'}</a> },
                    { title: <a onClick={() => navigate(`/merchant/hotel/${id}/rooms`)}>房间管理</a> },
                    { title: '新增房型' },
                ]}
            />
            <RoomEditForm
                form={form}
                onFinish={onFinish}
                actions={
                    <Space>
                        <Popconfirm
                            title="是否确认放弃"
                            description="退出后未保存的修改都将丢失"
                            onConfirm={onBack}
                            okText="是"
                            cancelText="否"
                        >
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(`/merchant/hotel/${id}/rooms`)}
                            >
                                返回
                            </Button>
                        </Popconfirm>
                        <Button
                            type="primary"
                            loading={submitLoading}
                            onClick={() => form.submit()}
                        >
                            创建
                        </Button>
                    </Space>
                }
            />
        </div>
    );
}