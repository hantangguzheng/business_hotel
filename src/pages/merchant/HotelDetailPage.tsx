import { useNavigate, useParams } from 'react-router';
import { Button, Space, Breadcrumb, Spin, Result, App } from 'antd';
import { EditOutlined, UnorderedListOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import styles from './HotelDetailPage.module.css';
import { useHotels } from '@/hooks/merchant';
import { HotelViewForm } from '@/components/HotelViewForm';

export const HotelDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message: msg } = App.useApp();


    const {loading, error, getHotel, refresh:refetch} = useHotels();
    const hotel = getHotel(Number(id));

    if (loading) {
        return (
            <div className={styles.center}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        msg.open({
            type:'error', 
            content:'信息加载失败, 请重试',
            duration:2,
        });
        return (
            <div className={styles.container}>
                <Result
                    status="error"
                    title="加载失败"
                    subTitle={error.message}
                    extra={
                        <Button onClick={() => refetch()}>重试</Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[
                    { title: <a onClick={() => navigate('/merchant/hotels')}>酒店信息管理</a> },
                    { title: hotel?.nameCn ?? '酒店详情' },
                ]}
            />

            <HotelViewForm
                hotel={hotel}
                actions={
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/merchant/hotels')}
                        >
                            返回
                        </Button>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/merchant/hotel/${id}/edit`)}
                        >
                            编辑酒店信息
                        </Button>
                        <Button
                            icon={<UnorderedListOutlined />}
                            type="primary"
                            onClick={() => navigate(`/merchant/hotel/${id}/rooms`)}
                        >
                            管理房间
                        </Button>
                        <Button
                            icon={<UnorderedListOutlined />}
                            type="primary"
                            onClick={() => navigate(`/merchant/hotel/${id}/promotions`)}
                        >
                            管理促销活动
                        </Button>
                    </Space>
                }
            />
        </div>
    );
}