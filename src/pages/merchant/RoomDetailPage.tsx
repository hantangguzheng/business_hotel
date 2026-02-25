import { RoomViewForm } from "@/components/RoomViewForm";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Space } from "antd";

import styles from './RoomDetailPage.module.css';
import { useLocation, useNavigate, useParams } from "react-router";
import { useHotels } from "@/hooks/merchant";
import type { IRoomListResponse } from "@/api/types/room";
import useAxios from "axios-hooks";
import { endpoint } from "@/api/endpoint";

export function RoomDetailPage() {
    const { id, rid } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { getHotel } = useHotels();
    const hotel = getHotel(Number(id));
    const roomSt: IRoomListResponse | undefined = state?.room;

    const [{ data: rooms }] = useAxios<IRoomListResponse[]>(
        endpoint.getListRooms(Number(id)), { manual: !!roomSt }  // 没有 state 时才请求
    );

    const room = roomSt ?? rooms?.find(r => r.id === Number(rid));

    return (
        <div className={styles.container}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[
                    { title: <a onClick={() => navigate('/merchant/hotels')}>酒店信息管理</a> },
                    { title: <a onClick={() => navigate(`/merchant/hotel/${id}`)}>{hotel?.nameCn ?? '酒店详情'}</a> },
                    { title: <a onClick={() => navigate(`/merchant/hotel/${id}/rooms`)}>房间管理</a> },
                    { title: room?.name ?? '房间详情' },
                ]}
            />
            <RoomViewForm
                room={room}
                actions={
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(`/merchant/hotel/${id}/rooms`)}
                        >
                            返回
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/merchant/hotel/${id}/room/${rid}/edit`, { state: { room } })}
                        >
                            编辑
                        </Button>
                    </Space>
                }
            />
        </div>
    );
}