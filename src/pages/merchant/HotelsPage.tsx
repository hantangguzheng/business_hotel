import { endpoint } from "@/api/endpoint";
import { App, Breadcrumb, Button, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxios from "axios-hooks";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import styles from './HotelsPage.module.css';
import type { IHotelListResponseSingle } from "@/api/types/hotel";
import type { CityCode, HotelStatus } from "@/types/hotel";
import { cityCodeMapping } from "@/utils/hotelUtil";
import { EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";

const statusMap: Record<HotelStatus, Record<string, string>> = {
    0: { label: '待审核', color: 'orange' },
    1: { label: '已发布', color: 'green' },
    2: { label: '审核拒绝', color: 'red' },
    3: { label: '下线', color: 'default' },
} as const;

export function HotelsPage() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [cityCode, setCityCode] = useState<CityCode | undefined>();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    // const [status, _] = useState<HotelStatus | undefined>();

    const { message: msg } = App.useApp();

    const [{ data, loading, error }, refetch] = useAxios<IHotelListResponseSingle[]>(
        { ...endpoint.getListHotels() }
    );

    const filtered = useMemo(() => {
        if (!data) return [];
        return data.filter(hotel => {
            const matchKeyword = !keyword || hotel.nameCn.includes(keyword);
            const matchCity = !cityCode || hotel.cityCode === cityCode;
            return matchKeyword && matchCity;
        });
    }, [data, keyword, cityCode]);

    const handleKeywordChange = (val: string) => {
        setKeyword(val);
        setPage(1);  // 重置页码
    };

    const handleCityChange = (val: CityCode) => {
        setCityCode(val);
        setPage(1);
    };

    // 前端分页
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);

    const columns: ColumnsType<IHotelListResponseSingle> = [
        {
            title: '酒店名称',
            dataIndex: 'nameCn',
            key: 'name',
        },
        {
            title: '城市',
            dataIndex: 'cityCode',
            key: 'cityCode',
            render: (code: CityCode) => (
                cityCodeMapping[code]
            ),
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
        },
        
        {
            title: '原价',
            dataIndex: 'crossLinePrice',
            key: 'crossLinePrice',
        },
        {
            title: '分数',
            dataIndex: 'score',
            key: 'score',
        },
        {
            title: '星级',
            dataIndex: 'starRating',
            key: 'starRating',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            filters: Object.entries(statusMap).map(([key, val]) => ({
                text: <Tag color={val.color}>{val.label}</Tag>,
                value: Number(key),
            })),
            onFilter: (value, record) => record.status === value,
            render: (status: HotelStatus) => (
                <Tag color={statusMap[status]?.color}>
                    {statusMap[status]?.label ?? '未知'}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, hotel) => (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/merchant/hotels/${hotel.id}`)}
                >
                    编辑
                </Button>
            ),
        },
    ];

    useEffect(() => {
        if (error) {
            msg.open({
                content: '数据获取失败',
                duration: 2,
                type: 'error',
            });
            console.error(error.message);
        }
    }, [error]);

    return (
        <div className={styles.container}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: '酒店信息管理' }]}
            />

            <div className={styles.toolbar}>
                <Space>
                    <Input
                        placeholder="搜索酒店名称"
                        prefix={<SearchOutlined />}
                        value={keyword}
                        onChange={e => handleKeywordChange(e.target.value)}
                        allowClear
                        style={{ width: 220 }}
                    />
                    <Select
                        placeholder="选择城市"
                        allowClear
                        style={{ width: 160 }}
                        onChange={val => handleCityChange(val)}
                        options={[
                            { label: '北京', value: '1' },
                            { label: '上海', value: '2' },
                        ]}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={loading}
                    >
                        刷新
                    </Button>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/merchant/hotels/new')}
                >
                    新增酒店
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={paginated}
                pagination={{
                    current: page,
                    pageSize,
                    total: filtered.length,
                    showTotal: (total) => `共 ${total} 条`,
                    showSizeChanger: true,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                    },
                }}
            />
        </div>
    );
}