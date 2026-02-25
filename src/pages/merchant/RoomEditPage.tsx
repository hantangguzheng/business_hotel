import { useLocation, useNavigate, useParams } from 'react-router';
import styles from './RoomEditPage.module.css';
import { App, Breadcrumb, Button, Form, Popconfirm, Space } from 'antd';
import { useHotels } from '@/hooks/merchant';
import { type IRoomCreateRequest, type IRoomListResponse } from '@/api/types/room';
import useAxios from 'axios-hooks';
import { endpoint } from '@/api/endpoint';
import { RoomEditForm } from '@/components/RoomEditForm';
import { ArrowLeftOutlined } from '@ant-design/icons';

export function RoomEditPage() {
    const { id, rid } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [form] = Form.useForm();
    const { message: msg, } = App.useApp();
    const { getHotel } = useHotels();
    const hotel = getHotel(Number(id));
    const room = (state as { room?: IRoomListResponse } | null)?.room;

    const [{ loading: submitLoading }, execUpdate] = useAxios<any, FormData | IRoomCreateRequest>(
        '', { manual: true }
    );

    const onFinish = async (data: FormData | IRoomCreateRequest) => {
        try {
            const curConfig = endpoint.putUpdateRoom(Number(rid), data);
            if (data instanceof FormData) {
                await execUpdate({
                    ...curConfig,
                    headers: { ...curConfig.headers, 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await execUpdate({ ...curConfig, });
            }
            msg.success('保存成功');
            navigate(`/merchant/hotel/${id}/rooms`);
        } catch (e: any) {
            msg.error(e?.message ?? '保存失败');
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
                    { title: room?.name ?? '房间详情' },
                    { title: '编辑' },
                ]}
            />
            <RoomEditForm
                form={form}
                room={room}
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
                        <Button icon={<ArrowLeftOutlined />}>
                            返回
                        </Button>
                        </Popconfirm>
                        <Button
                            type="primary"
                            loading={submitLoading}
                            onClick={() => form.submit()}
                        >
                            保存
                        </Button>
                    </Space>
                }
            />
        </div>
    );
}