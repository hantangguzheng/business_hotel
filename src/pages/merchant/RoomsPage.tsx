import { Breadcrumb, Button, Popconfirm, Space, Table, Image, App } from 'antd';
import styles from './RoomsPage.module.css';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useHotels } from '@/hooks/merchant';
import useAxios from 'axios-hooks';
import { endpoint } from '@/api/endpoint';
import type { ColumnsType } from 'antd/es/table';
import type { IRoomListResponse } from '@/api/types/room';
import { areaTitleMapping, bedTitleMapping } from '@/utils/roomUtil';
import type { AreaTitle, BedTitle } from '@/types/room';

export function RoomsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message: msg } = App.useApp();
  const isAdmin = useLocation().pathname.startsWith('/admin');
  const { getHotel } = useHotels(!isAdmin);
  const hotel = getHotel(Number(id));

  const rolePrefix = isAdmin?'admin':'merchant';

  const [{ data, loading }, refetch] = useAxios<IRoomListResponse[]>(
    endpoint.getListRooms(Number(id))
  );

  const [, execDelete] = useAxios('', { manual: true });

  const onDelete = async (roomId: number) => {
    try {
      await execDelete(endpoint.deleteDeleteRoom(roomId));
      msg.success('删除成功');
      refetch();
    } catch (e: any) {
      msg.error(e?.message ?? '删除失败');
    }
  };

  const columns: ColumnsType<IRoomListResponse> = [
    {
      title: '图片',
      dataIndex: 'pictureUrl',
      key: 'pictureUrl',
      width: 80,
      render: url => (
        <Image src={url} width={60} height={40} style={{ objectFit: 'cover' }} />
      ),
    },
    {
      title: '房型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '床型',
      dataIndex: 'bedTitle',
      key: 'bedTitle',
      render: (b:BedTitle)=>bedTitleMapping[b]??b,
    },
    {
      title: '面积',
      dataIndex: 'areaTitle',
      key: 'areaTitle',
      render: (a:AreaTitle)=>areaTitleMapping[a]??a,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: price => `¥ ${price}`,
    },
    {
      title: '库存',
      dataIndex: 'totalStock',
      key: 'totalStock',
    },
    {
      title: '人数容量',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: '楼层',
      dataIndex: 'floorTitle',
      key: 'floorTitle',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, room) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/${rolePrefix}/hotel/${id}/room/${room.id}`, { state: { room } })}
          >
            查看
          </Button>
          {!isAdmin && (<><Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/${rolePrefix}/hotel/${id}/room/${room.id}/edit`, { state: { room } })}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后不可恢复，确认删除该房型吗？"
            onConfirm={() => onDelete(room.id)}
            okText="删除"
            okButtonProps={{ danger: true }}
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm></>)}
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
          { title: '房间管理' },
        ]}
      />
      {!isAdmin && (<div className={styles.toolbar}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${rolePrefix}/hotel/${id}/room/create`)}
        >
          新增房型
        </Button>
      </div>)}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data ?? []}
        pagination={false}
      />
    </div>
  );
}