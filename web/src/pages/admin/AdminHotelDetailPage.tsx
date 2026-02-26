
import { useLocation, useNavigate, useParams } from 'react-router';
import styles from './AdminHotelDetailPage.module.css';
import { App, Breadcrumb, Button, Form, Input, Modal, Space } from 'antd';
import type { IHotelListResponseSingle } from '@/api/types/hotel';
import { useState } from 'react';
import useAxios from 'axios-hooks';
import { endpoint } from '@/api/endpoint';
import { HotelStatus } from '@/types/hotel';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, MinusCircleOutlined, RedoOutlined } from '@ant-design/icons';
import { HotelViewForm } from '@/components/HotelViewForm';

export function AdminHotelDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { message: msg } = App.useApp();
    const hotelSt = (state as { hotel?: IHotelListResponseSingle } | null)?.hotel;

    const [{ data: list }] = useAxios<IHotelListResponseSingle[]>(
        endpoint.getListHotelAdmin({}), { manual: !!hotelSt }
    );

    const hotel = hotelSt ?? list?.find(h => h.id === Number(id));

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectForm] = Form.useForm();

    const [, execApprove] = useAxios('', { manual: true });
    const [, execReject] = useAxios('', { manual: true });
    const [, execOffline] = useAxios('', { manual: true });
    const [, execRestore] = useAxios('', { manual: true });

    const onApprove = async () => {
        try {
            await execApprove(endpoint.postApproveAdmin(Number(id)));
            msg.success('发布成功');
            navigate(-1);
        } catch (e: any) {
            msg.error(e?.message ?? '操作失败');
        }
    };

    const onReject = async () => {
        try {
            const { auditReason } = await rejectForm.validateFields();
            await execReject(endpoint.postRejectAdmin(Number(id), { auditReason }));
            msg.success('已拒绝');
            setRejectModalOpen(false);
            navigate(-1);
        } catch (e: any) {
            if (e?.errorFields) return;
            msg.error(e?.message ?? '操作失败');
        }
    };

    const onOffline = async () => {
        try {
            await execOffline(endpoint.postOfflineAdmin(Number(id)));
            msg.success('已下线');
            navigate(-1);
        } catch (e: any) {
            msg.error(e?.message ?? '操作失败');
        }
    };

    const onRestore = async () => {
        try {
            await execRestore(endpoint.postRestoreAdmin(Number(id)));
            msg.success('已恢复');
            navigate(-1);
        } catch (e: any) {
            msg.error(e?.message ?? '操作失败');
        }
    };

    const renderActions = () => {
        switch (hotel?.status) {
            case HotelStatus.PENDING:
                return (
                    <>
                        <Button type="primary" icon={<CheckOutlined />} onClick={onApprove}>发布</Button>
                        <Button danger icon={<CloseOutlined />} onClick={() => setRejectModalOpen(true)}>拒绝</Button>
                    </>
                );
            case HotelStatus.APPROVED:
                return <Button danger icon={<MinusCircleOutlined />} onClick={onOffline}>下线</Button>;
            case HotelStatus.REJECTED:
                return <Button icon={<RedoOutlined />} onClick={onApprove}>重新发布</Button>;
            case HotelStatus.OFFLINED:
                return <Button icon={<RedoOutlined />} onClick={onRestore}>恢复</Button>;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[
                    { title: <a onClick={() => navigate('/admin/hotels')}>酒店审核</a> },
                    { title: hotel?.nameCn ?? '酒店详情' },
                ]}
            />

            <HotelViewForm
                hotel={hotel}
                actions={
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
                        <Button onClick={() => navigate(`/admin/hotel/${id}/rooms`, { state: { hotel: hotel } })}>
                            查看房间
                        </Button>
                        {/* <Button onClick={() => navigate(`/admin/hotel/${id}/promotions`, { state: { hotel: hotel } })}>
                            查看促销
                        </Button> */}
                        {renderActions()}
                    </Space>
                }
            />

            <Modal
                title="拒绝原因"
                open={rejectModalOpen}
                onOk={onReject}
                onCancel={() => setRejectModalOpen(false)}
                okText="确认拒绝"
                okButtonProps={{ danger: true }}
                cancelText="取消"
            >
                <Form form={rejectForm} layout="vertical">
                    <Form.Item
                        name="auditReason"
                        label="拒绝原因"
                        rules={[{ required: true, message: '请填写拒绝原因' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请填写拒绝原因" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}