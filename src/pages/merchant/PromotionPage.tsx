import { App, Breadcrumb, Button, DatePicker, Form, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import styles from './PromotionPage.module.css';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { endpoint } from '@/api/endpoint';
import useAxios from 'axios-hooks';
import { useState } from 'react';
import { useHotels } from '@/hooks/merchant';
import { useLocation, useNavigate, useParams } from 'react-router';
import { promotionTypeMapping } from '@/utils/hotelUtil';
import type { PromotionType } from '@/types/hotel';
import type { IPromotionCreateRequest, IPromotionListRespone } from '@/api/types/hotel';


const promotionTypeOptions = Object.entries(promotionTypeMapping).map(([value, label]) => ({
    label,
    value,
}));


export function PromotionsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message: msg } = App.useApp();
    
    const isAdmin = useLocation().pathname.startsWith('/admin');
    const { getHotel } = useHotels(!isAdmin);
    const hotel = getHotel(Number(id));
    const [form] = Form.useForm();

    const rolePrefix = isAdmin?'admin':'merchant';

    const [modalOpen, setModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<IPromotionListRespone | null>(null);

    const [{ data, loading }, refetch] = useAxios<IPromotionListRespone[]>(
        endpoint.getListPromotion(Number(id))
    );

    const [{ loading: submitLoading }, execCreate] = useAxios<any, IPromotionCreateRequest>(
        '', { manual: true }
    );
    const [, execUpdate] = useAxios('', { manual: true });
    const [, execDelete] = useAxios('', { manual: true });

    const openCreate = () => {
        setEditingPromotion(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (promotion: IPromotionListRespone) => {
        setEditingPromotion(promotion);
        form.setFieldsValue({
            promotionType: promotion.promotionType,
            discount: Number(promotion.discount),
            startDate: dayjs(promotion.startDate),
            endDate: dayjs(promotion.endDate),
        });
        setModalOpen(true);
    };

    const onSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: IPromotionCreateRequest = {
                ...values,
                discount: String(values.discount),
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
            };

            if (editingPromotion) {
                await execUpdate(endpoint.putUpdatePromotion(Number(id), editingPromotion.id, payload));
                msg.success('更新成功');
            } else {
                await execCreate(endpoint.postCreatePromotion(Number(id), payload));
                msg.success('创建成功');
            }
            setModalOpen(false);
            refetch();
        } catch (e: any) {
            if (e?.errorFields) return; // 表单验证失败
            msg.error(e?.message ?? '操作失败');
        }
    };

    const onDelete = async (promotionId: number) => {
        try {
            await execDelete(endpoint.deleteDeletePromotion(Number(id), promotionId));
            msg.success('删除成功');
            refetch();
        } catch (e: any) {
            msg.error(e?.message ?? '删除失败');
        }
    };

    const getPromotionStatus = (promotion: IPromotionListRespone) => {
        const now = dayjs();
        const start = dayjs(promotion.startDate);
        const end = dayjs(promotion.endDate);
        if (now.isBefore(start)) return { label: '未开始', color: 'blue' };
        if (now.isAfter(end)) return { label: '已结束', color: 'default' };
        return { label: '进行中', color: 'green' };
    };


    const columns: ColumnsType<IPromotionListRespone> = [
        {
            title: '类型',
            dataIndex: 'promotionType',
            key: 'promotionType',
            render: (type: PromotionType) => promotionTypeMapping[type] ?? type,
        },
        {
            title: '折扣',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount: string) => `${(Number(discount) * 10).toFixed(1)} 折`,
        },
        {
            title: '开始日期',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: '结束日期',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '状态',
            key: 'status',
            render: (_, promotion) => {
                const status = getPromotionStatus(promotion);
                return <Tag color={status.color}>{status.label}</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_, promotion) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openEdit(promotion)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确认删除"
                        description="确认删除该促销活动吗？"
                        onConfirm={() => onDelete(promotion.id)}
                        okText="删除"
                        okButtonProps={{ danger: true }}
                        cancelText="取消"
                    >
                        <Button danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[
                    { title: <a onClick={() => navigate(`/${rolePrefix}/hotels`)}>酒店信息管理</a> },
                    { title: <a onClick={() => navigate(`/${rolePrefix}/hotel/${id}`)}>{hotel?.nameCn ?? '酒店详情'}</a> },
                    { title: '促销管理' },
                ]}
            />

            <div className={styles.toolbar}>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    新增促销
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data ?? []}
                pagination={false}
            />

            <Modal
                title={editingPromotion ? '编辑促销' : '新增促销'}
                open={modalOpen}
                onOk={onSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingPromotion ? '保存' : '创建'}
                cancelText="取消"
                confirmLoading={submitLoading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item name="promotionType" label="促销类型" rules={[{ required: true }]}>
                        <Select options={promotionTypeOptions} />
                    </Form.Item>

                    <Form.Item
                        name="discount"
                        label="折扣"
                        rules={[
                            { required: true },
                            { type: 'number', min: 0.01, max: 1, message: '折扣范围为 0.01 ~ 1.0' },
                        ]}
                    >
                        <InputNumber
                            min={0.01}
                            max={1}
                            step={0.01}
                            style={{ width: '100%' }}
                            placeholder="例：0.8 表示八折"
                        />
                    </Form.Item>

                    <Form.Item name="startDate" label="开始日期" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} onChange={() => form.validateFields(['endDate'])} />
                    </Form.Item>

                    <Form.Item name="endDate" label="结束日期" dependencies={['startDate']} rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const startDate = getFieldValue('startDate');
                                if (!value || !startDate || value.isAfter(startDate)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('结束日期必须在开始日期之后'));
                            },
                        }),
                    ]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}