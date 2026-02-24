import { useEffect, useState } from 'react';
import {
    Form, Input, InputNumber, Select, DatePicker,
    Checkbox, Divider, Row, Col,
    Image,
    Upload,
    type UploadFile,
} from 'antd';
import dayjs from 'dayjs';
import { cityCodeMapping, hotelTagMapping } from '@/utils/hotelUtil';
import type { IHotelCreateRequest, IHotelListResponseSingle } from '@/api/types/hotel';
import { PlusOutlined } from '@ant-design/icons';
import { STATIC_ROOT } from '@/utils/config';

const HOTEL_TAGS = Object.entries(hotelTagMapping).map(([k, v]) => ({ label: v, value: k }));
const CITY_CODE = Object.entries(cityCodeMapping).map(([k, v]) => ({ label: v, value: k }));

const STAR_OPTIONS = [1, 2, 3, 4, 5].map(n => ({
    label: `${n}星`,
    value: n,
}));


interface HotelEditFormProps {
    form: ReturnType<typeof Form.useForm>[0];
    hotel?: IHotelListResponseSingle;
    loading?: boolean;
    readonly?: boolean;
    actions?: React.ReactNode;
    onFinish?: (values: FormData | IHotelCreateRequest) => void;
}

export const HotelEditForm = ({
    form,
    hotel,
    loading,
    readonly,
    actions,
    onFinish,
}: HotelEditFormProps) => {

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        if (hotel) {
            form.setFieldsValue({
                ...hotel,
                openingDate: hotel.openingDate ? dayjs(hotel.openingDate) : undefined,
            });
            setFileList(
                hotel.imageUrls?.map((url, index) => ({
                    uid: String(index),
                    name: `image-${index}`,
                    status: 'done' as const,
                    url,
                })) ?? []
            );
        }
    }, [hotel, form]);

    const handlePreview = (file: UploadFile) => {
        setPreviewImage(file.url ?? file.thumbUrl ?? '');
        setPreviewOpen(true);
    };

    const handleFinish = (values: any) => {
        console.log(values);
        const existingUrls = fileList
            .filter(f => f.status === 'done' && f.url)
            .map(f => {
                const url = f.url!;
                return url.startsWith(STATIC_ROOT)?url.slice(STATIC_ROOT.length):url;
            });

        const newFiles = fileList
            .filter(f => f.originFileObj)
            .map(f => f.originFileObj!);

        const payload = {
            ...values,
            openingDate: values.openingDate?.toISOString(),
        };
        delete payload.imageUrls;

        if (newFiles.length > 0) {
            const formData = new FormData();
            newFiles.forEach(f => formData.append('images', f));
            existingUrls.forEach(url => formData.append('imageUrls', url));
            Object.entries(payload).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    if (Array.isArray(val)) {
                        val.forEach(v=>formData.append(key, v));
                    } else {
                        formData.append(key, String(val));
                    }
                    
                }
            });
            onFinish?.(formData);
        } else {
            onFinish?.({ ...payload, imageUrls: existingUrls });
        }
    };

    return (<>
        <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16 }}
            disabled={readonly || loading}
            onFinish={handleFinish}
        >
            <Divider titlePlacement="start">基本信息</Divider>

            <Form.Item name="nameCn" label="中文名称" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="nameEn" label="英文名称" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="address" label="地址" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="cityCode" label="城市" rules={[{ required: true }]}>
                <Select options={CITY_CODE} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="starRating" label="星级" rules={[{ required: true }]}>
                <Select options={STAR_OPTIONS} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="openingDate" label="开业日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Divider titlePlacement="start">价格</Divider>

            <Form.Item name="price" label="价格" rules={[{ required: true }]}>
                <Input prefix="¥" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item name="crossLinePrice" label="原价">
                <Input prefix="¥" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item name="currency" label="货币" style={{ display: 'none' }}>
                <Input value={'CNY'} placeholder="CNY" style={{ width: 120 }} />
            </Form.Item>

            <Divider titlePlacement="start">位置</Divider>

            <Row>
                <Col span={12}>
                    <Form.Item
                        name="latitude"
                        label="纬度"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        rules={[{ required: true }]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="longitude"
                        label="经度"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 14 }}
                        rules={[{ required: true }]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider titlePlacement="start">其他</Divider>

            <Form.Item name="score" label="评分">
                <InputNumber min={0} max={5} step={0.1} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="totalReviews" label="评论数">
                <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="shortTags" label="标签">
                <Checkbox.Group options={HOTEL_TAGS} />
            </Form.Item>

            {/* <Form.Item name="imageUrls" label="图片链接">
        <Select
          mode="tags"
          placeholder="输入图片 URL 后按回车"
          style={{ width: '100%' }}
        />
      </Form.Item> */}

            <Form.Item label="图片">
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={({ fileList: newList }) => setFileList(newList)}
                    beforeUpload={() => false}
                    accept="image/*"
                    disabled={readonly}
                >
                    {!readonly && (
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>上传文件</div>
                        </div>
                    )}
                </Upload>

                {!readonly && (
                    <Input.Search
                        placeholder="输入图片 URL 后按回车添加"
                        enterButton="添加"
                        onSearch={url => {
                            if (!url.trim()) return;
                            setFileList(prev => [
                                ...prev,
                                {
                                    uid: `url-${Date.now()}`,
                                    name: url,
                                    status: 'done' as const,
                                    url,
                                },
                            ]);
                        }}
                        style={{ marginTop: 8 }}
                    />
                )}
                <Image
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: setPreviewOpen,
                    }}
                    src={previewImage}
                />
            </Form.Item>

        </Form>
        {actions && (
            <div style={{ marginTop: 24 }}>
                {actions}
            </div>
        )}
    </>
    );
}