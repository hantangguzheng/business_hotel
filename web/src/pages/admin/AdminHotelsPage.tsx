import { App, Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from 'antd';
import styles from './AdminHotelsPage.module.css';
import { CheckOutlined, CheckSquareOutlined, CloseOutlined, MinusCircleOutlined, RedoOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { CityCode, HotelStatus } from '@/types/hotel';
import { cityCodeMapping } from '@/utils/hotelUtil';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { endpoint } from '@/api/endpoint';
import useAxios from 'axios-hooks';
import type { IHotelListResponseSingle } from '@/api/types/hotel';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const cityOptions = Object.entries(cityCodeMapping).map(([value, label]) => ({ label, value }));

const statusMap: Record<HotelStatus, Record<string, string>> = {
    0: { label: '待审核', color: 'orange' },
    1: { label: '已发布', color: 'green' },
    2: { label: '审核拒绝', color: 'red' },
    3: { label: '下线', color: 'default' },
} as const;

export function AdminHotelsPage() {
  const navigate = useNavigate();
  const { message: msg, modal } = App.useApp();

  const [status, setStatus] = useState<HotelStatus | undefined>();
  const [keyword, setKeyword] = useState('');
  const [cityCode, setCityCode] = useState<CityCode | undefined>();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectForm] = Form.useForm();

  const [{ data, loading }, refetch] = useAxios<IHotelListResponseSingle[]>(
    endpoint.getListHotelAdmin({ status, keyword, cityCode }),
    {useCache:false, }
  );

  const [, execApprove] = useAxios('', { manual: true });
  const [, execReject] = useAxios('', { manual: true });
  const [, execOffline] = useAxios('', { manual: true });
  const [, execRestore] = useAxios('', { manual: true });
  const [{ loading: approveAllLoading }, execApproveAll] = useAxios(
    endpoint.postApproveAllAdmin(), { manual: true }
  );

  const onApprove = async (id: number) => {
    try {
      await execApprove(endpoint.postApproveAdmin(id));
      msg.success('发布成功');
      refetch(endpoint.getListHotelAdmin({ status, keyword, cityCode }));
    } catch (e: any) {
      msg.error(e?.message ?? '操作失败');
    }
  };

  const openReject = (id: number) => {
    setRejectingId(id);
    rejectForm.resetFields();
    setRejectModalOpen(true);
  };

  const onReject = async () => {
    try {
      const { auditReason } = await rejectForm.validateFields();
      await execReject(endpoint.postRejectAdmin(rejectingId!, {auditReason}));
      msg.success('已拒绝');
      setRejectModalOpen(false);
      refetch(endpoint.getListHotelAdmin({ status, keyword, cityCode }));
    } catch (e: any) {
      if (e?.errorFields) return;
      msg.error(e?.message ?? '操作失败');
    }
  };

  const onOffline = async (id: number) => {
    try {
      await execOffline(endpoint.postOfflineAdmin(id));
      msg.success('已下线');
      refetch(endpoint.getListHotelAdmin({ status, keyword, cityCode }));
    } catch (e: any) {
      msg.error(e?.message ?? '操作失败');
    }
  };

  const onRestore = async (id: number) => {
    try {
      await execRestore(endpoint.postRestoreAdmin(id));
      msg.success('已恢复');
      refetch(endpoint.getListHotelAdmin({ status, keyword, cityCode }));
    } catch (e: any) {
      msg.error(e?.message ?? '操作失败');
    }
  };

  const onApproveAll = () => {
    modal.confirm({
      title: '批量发布',
      content: '确认发布所有待审核的酒店吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await execApproveAll();
          msg.success('批量发布成功');
          refetch(endpoint.getListHotelAdmin({ status, keyword, cityCode }));
        } catch (e: any) {
          msg.error(e?.message ?? '操作失败');
        }
      },
    });
  };

  const renderActions = (hotel: IHotelListResponseSingle) => {
    switch (hotel.status) {
      case HotelStatus.PENDING:
        return (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onApprove(hotel.id)}
            >
              发布
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => openReject(hotel.id)}
            >
              拒绝
            </Button>
          </Space>
        );
      case HotelStatus.APPROVED:
        return (
          <Popconfirm
            title="确认下线"
            description="下线后用户将无法看到该酒店，确认下线吗？"
            onConfirm={() => onOffline(hotel.id)}
            okText="下线"
            okButtonProps={{ danger: true }}
            cancelText="取消"
          >
            <Button danger icon={<MinusCircleOutlined />}>下线</Button>
          </Popconfirm>
        );
      case HotelStatus.REJECTED:
        return (
          <Button
            icon={<RedoOutlined />}
            onClick={() => onApprove(hotel.id)}
          >
            重新发布
          </Button>
        );
      case HotelStatus.OFFLINED:
        return (
          <Popconfirm
            title="确认恢复"
            description="恢复后用户将重新看到该酒店，确认恢复吗？"
            onConfirm={() => onRestore(hotel.id)}
            okText="恢复"
            cancelText="取消"
          >
            <Button icon={<RedoOutlined />}>恢复</Button>
          </Popconfirm>
        );
      default:
        return null;
    }
  };

  const columns: ColumnsType<IHotelListResponseSingle> = [
    {
      title: '酒店名称',
      dataIndex: 'nameCn',
      key: 'nameCn',
    },
    {
      title: '城市',
      dataIndex: 'cityCode',
      key: 'cityCode',
      render: (code: CityCode) => cityCodeMapping[code] ?? code,
    },
    {
      title: '星级',
      dataIndex: 'starRating',
      key: 'starRating',
      render: (rating: number) => `${rating} 星`,
    },
    {
      title: '创建时间',
      dataIndex: 'create_at',
      key: 'create_at',
      render: (createat:string) => dayjs(createat).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: HotelStatus) => (
        <Tag color={statusMap[s]?.color}>
          {statusMap[s]?.label ?? '未知'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, hotel) => (
        <Space>
          <Button onClick={() => navigate(`/admin/hotel/${hotel.id}`, { state: { hotel } })}>
            查看
          </Button>
          {renderActions(hotel)}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Tabs
        activeKey={String(status ?? 'all')}
        onChange={(key) => setStatus(key === 'all' ? undefined : Number(key) as HotelStatus)}
        items={[
          { key: 'all', label: '全部' },
          { key: String(HotelStatus.PENDING), label: '待审核' },
          { key: String(HotelStatus.APPROVED), label: '通过' },
          { key: String(HotelStatus.REJECTED), label: '审核拒绝' },
          { key: String(HotelStatus.OFFLINED), label: '下线' },
        ]}
      />

      <div className={styles.toolbar}>
        <Space>
          <Input
            placeholder="搜索酒店名称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => {
              setKeyword(e.target.value);
            }}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            placeholder="选择城市"
            allowClear
            style={{ width: 160 }}
            options={cityOptions}
            onChange={val => setCityCode(val)}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => refetch()}
          >
            刷新
          </Button>
        </Space>
        {status === HotelStatus.PENDING && (
          <Button
            type="primary"
            icon={<CheckSquareOutlined />}
            loading={approveAllLoading}
            onClick={onApproveAll}
          >
            批量发布
          </Button>
        )}
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data ?? []}
        pagination={{
          showTotal: total => `共 ${total} 条`,
          showSizeChanger: true,
        }}
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