import type { IRoomListResponse } from '@/api/types/room';
import type { BedTitle } from '@/types/room';
import { areaTitleMapping, bedTitleMapping, facilityFieldMap, facilityGroupLabels, facilityLabelMap, smokeTitleMapping, wifiTitleMapping, windowTitleMapping } from '@/utils/roomUtil';
import { processImgUrl } from '@/utils/urlUtil';
import { Descriptions, Divider, Image, Result } from 'antd';

interface RoomViewFormProps {
    room?: IRoomListResponse;
    loading?: boolean;
    actions?: React.ReactNode;
}

const dividerStyles = { content: { marginLeft: -60, fontWeight: 'bold' } };

export const RoomViewForm = ({ room, loading, actions }: RoomViewFormProps) => {
    return (
        <>
            {!loading && <>
                <Divider titlePlacement="start" styles={dividerStyles}>基本信息</Divider>
                <Descriptions column={2}>
                    <Descriptions.Item label="房型名称" span={2}>{room?.name}</Descriptions.Item>
                    <Descriptions.Item label="床型">{bedTitleMapping[room?.bedTitle as BedTitle] ?? room?.bedTitle}</Descriptions.Item>
                    <Descriptions.Item label="面积">{room?(areaTitleMapping[room.areaTitle]):''}</Descriptions.Item>
                    <Descriptions.Item label="窗户">{room?(windowTitleMapping[room.windowTitle]):''}</Descriptions.Item>
                    <Descriptions.Item label="楼层">{room?(`${room.floorTitle}楼`):''}</Descriptions.Item>
                    <Descriptions.Item label="吸烟政策">{room?(smokeTitleMapping[room.smokeTitle]):''}</Descriptions.Item>
                    <Descriptions.Item label="WiFi">{room?.wifiInfo?(wifiTitleMapping[room.wifiInfo]):''}</Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="start" styles={dividerStyles}>价格与库存</Divider>
                <Descriptions column={2}>
                    <Descriptions.Item label="价格">¥ {room?.price}</Descriptions.Item>
                    <Descriptions.Item label="库存">{room?.totalStock}</Descriptions.Item>
                    <Descriptions.Item label="容纳人数">{room?.capacity}</Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="start" styles={dividerStyles}>图片</Divider>
                <Descriptions column={1}>
                    <Descriptions.Item label="房间图片">
                        {room?.pictureUrl && (
                            <Image
                                src={processImgUrl(room.pictureUrl)}
                                width={200}
                                style={{ objectFit: 'cover' }}
                            />
                        )}
                    </Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="start" styles={dividerStyles}>设施</Divider>
                <Descriptions column={1}>
                    {Object.entries(facilityFieldMap).map(([facilityKey, fieldKey]) => {
                        const values = room?.[fieldKey] as string[] | undefined;
                        if (!values?.length) return null;
                        const labelMap = facilityLabelMap[facilityKey as keyof typeof facilityFieldMap];
                        return (
                            <Descriptions.Item key={facilityKey} label={facilityGroupLabels[facilityKey]}>
                                {values.map(v => labelMap?.[v] ?? v).join('、')}
                            </Descriptions.Item>
                        );
                    })}
                </Descriptions>
            </>}

            {loading && <Result status="info" title="加载中" />}

            {actions && <div style={{ marginTop: 24 }}>{actions}</div>}
        </>
    );
};