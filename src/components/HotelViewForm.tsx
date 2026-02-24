import {
    Divider,
    Descriptions, Image,
    Result,
    Space,
} from 'antd';
import { cityCodeMapping, hotelTagMapping } from '@/utils/hotelUtil';
import type { IHotelListResponseSingle } from '@/api/types/hotel';


interface HotelViewFormProps {
    hotel?: IHotelListResponseSingle;
    loading?: boolean;
    actions?: React.ReactNode;
}

const dividerStyles = { content: { marginLeft: -60, fontWeight: 'bold' } };

export const HotelViewForm = ({
    hotel,
    loading,
    actions,
}: HotelViewFormProps) => {

    return (
        <>
            {!loading && <>
                <Divider titlePlacement="start" styles={dividerStyles}>基本信息</Divider>
                <Descriptions column={2}>
                    <Descriptions.Item label="名称">{hotel?.nameCn}</Descriptions.Item>
                    {/* <Descriptions.Item label="中文名称">{hotel?.nameCn}</Descriptions.Item> */}
                    <Descriptions.Item label="英文名称">{hotel?.nameEn}</Descriptions.Item>
                    <Descriptions.Item label="地址" span={2}>{hotel?.address}</Descriptions.Item>
                    <Descriptions.Item label="城市">{hotel ? cityCodeMapping[hotel.cityCode] : '位置'}</Descriptions.Item>
                    <Descriptions.Item label="星级">{hotel?.starRating} 星</Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="start" styles={dividerStyles}>价格</Divider>
                <Descriptions column={2} >
                    <Descriptions.Item label="价格">¥ {hotel?.price}</Descriptions.Item>
                    <Descriptions.Item label="原价">¥ {hotel?.crossLinePrice}</Descriptions.Item>
                    <Descriptions.Item label="货币">{hotel?.currency}</Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="start" styles={dividerStyles}>位置</Divider>
                <Descriptions column={2}>
                    <Descriptions.Item label="纬度">{hotel?.latitude}</Descriptions.Item>
                    <Descriptions.Item label="经度">{hotel?.longitude}</Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="start" styles={dividerStyles}>其他</Divider>
                <Descriptions column={1}>
                    <Descriptions.Item label="评分">{hotel?.score}</Descriptions.Item>
                    <Descriptions.Item label="评论数">{hotel?.totalReviews}</Descriptions.Item>
                    <Descriptions.Item label="标签">{hotel?.shortTags?.map((tag) => hotelTagMapping[tag]).join(', ')}</Descriptions.Item>
                    {/* <Descriptions.Item label="图片链接" span={2}>
                        {hotel?.imageUrls?.join(', ')}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="图片" span={2}>
                        <Image.PreviewGroup>
                            <Space wrap>
                                {hotel?.imageUrls?.map((url, index) => (
                                    <Image
                                        key={index}
                                        src={url}
                                        width={120}
                                        height={80}
                                        style={{ objectFit: 'cover' }}
                                    />
                                ))}
                            </Space>
                        </Image.PreviewGroup>
                    </Descriptions.Item>
                </Descriptions>
            </>}

            {loading && <Result
                status="info"
                title="加载中" />}

            {actions && (
                <div style={{ marginTop: 24 }}>
                    {actions}
                </div>
            )}
        </>
    );
}