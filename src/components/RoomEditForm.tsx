import { useEffect, useState } from 'react';
import {
  Form, Input, InputNumber, Select, Checkbox, Divider, Image, Upload, type UploadFile,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { STATIC_ROOT } from '@/utils/config';
import { areaTitleMapping, bedTitleMapping, facilityFieldMap, facilityGroupLabels, facilityLabelMap, smokeTitleMapping, wifiTitleMapping, windowTitleMapping } from '@/utils/roomUtil';
import type { IRoomCreateRequest, IRoomListResponse } from '@/api/types/room';
import { processImgUrl } from '@/utils/urlUtil';

const bedTitleOptions = Object.entries(bedTitleMapping).map(([value, label]) => ({ label, value }));
const areaTitleOptions = Object.entries(areaTitleMapping).map(([value, label]) => ({ label, value }));
const smokeTitleOptions = Object.entries(smokeTitleMapping).map(([value, label]) => ({ label, value }));
const windowTitleOptions = Object.entries(windowTitleMapping).map(([value, label]) => ({ label, value }));
const wifiTitleOptions = Object.entries(wifiTitleMapping).map(([value, label]) => ({ label, value }));

interface RoomEditFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  room?: IRoomListResponse;
  loading?: boolean;
  readonly?: boolean;
  actions?: React.ReactNode;
  onFinish?: (data: FormData | IRoomCreateRequest) => void;
}

export const RoomEditForm = ({
  form,
  room,
  loading,
  readonly,
  actions,
  onFinish,
}: RoomEditFormProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (room) {
      form.setFieldsValue(room);
      if (room.pictureUrl) {
        setFileList([{
          uid: '0',
          name: 'picture',
          status: 'done' as const,
          url: processImgUrl(room.pictureUrl),
        }]);
      }
    }
  }, [room, form]);

  const handleFinish = (values: any) => {
    const file = fileList.find(f => f.originFileObj);
    const existingUrlU = fileList.find(f => f.status === 'done' && f.url)?.url;
    const sliceUrl = existingUrlU?.slice(STATIC_ROOT.length)
    const existingUrl = existingUrlU?.startsWith(STATIC_ROOT)?sliceUrl:existingUrlU;


    const payload = { ...values };
    // 清理空数组
    Object.keys(payload).forEach(key => {
      if (Array.isArray(payload[key]) && payload[key].length === 0) {
        delete payload[key];
      }
    });

    if (file?.originFileObj) {
      const formData = new FormData();
      formData.append('image', file.originFileObj);
      Object.entries(payload).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach(v => formData.append(key, v));
          } else {
            formData.append(key, String(val));
          }
        }
      });
      onFinish?.(formData);
    } else {
      if (existingUrl) {
        const url = existingUrl.startsWith(STATIC_ROOT)
          ? existingUrl.slice(STATIC_ROOT.length)
          : existingUrl;
        payload.pictureUrl = url;
      }
      onFinish?.(payload);
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        disabled={readonly || loading}
        onFinish={handleFinish}
      >
        <Divider titlePlacement="start">基本信息</Divider>

        <Form.Item name="name" label="房型名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bedTitle" label="床型" rules={[{ required: true }]}>
          <Select options={bedTitleOptions} style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="areaTitle" label="面积" rules={[{ required: true }]}>
          <Select options={areaTitleOptions} style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="windowTitle" label="窗户" rules={[{ required: true }]}>
          <Select options={windowTitleOptions} style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="floorTitle" label="楼层" rules={[{ required: true }]}>
          <Input placeholder="例：3" />
        </Form.Item>
        <Form.Item name="smokeTitle" label="吸烟政策" rules={[{ required: true }]}>
          <Select options={smokeTitleOptions} style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="wifiInfo" label="WiFi">
          <Select options={wifiTitleOptions} style={{ width: 160 }} />
        </Form.Item>

        <Divider titlePlacement="start">价格与库存</Divider>

        <Form.Item name="price" label="价格" rules={[{ required: true }]}>
          <Input prefix="¥" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="totalStock" label="库存" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="capacity" label="容纳人数">
          <InputNumber min={1} style={{ width: 120 }} />
        </Form.Item>

        <Divider titlePlacement="start">图片</Divider>

        <Form.Item label="房间图片">
          <Upload
            listType="picture-card"
            fileList={fileList}
            maxCount={1}
            onPreview={file => {
              setPreviewImage(file.url ?? file.thumbUrl ?? '');
              setPreviewOpen(true);
            }}
            onChange={({ fileList: newList }) => setFileList(newList)}
            beforeUpload={() => false}
            accept="image/*"
            disabled={readonly}
          >
            {fileList.length < 1 && !readonly && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
          {!readonly && fileList.length < 1 && (
            <Input.Search
              placeholder="或输入图片 URL 后按回车"
              enterButton="添加"
              style={{ marginTop: 8 }}
              onSearch={url => {
                if (!url.trim()) return;
                setFileList([{
                  uid: `url-${Date.now()}`,
                  name: url,
                  status: 'done' as const,
                  url,
                }]);
              }}
            />
          )}
          <Image
            styles={{ root: { display: 'none' } }}
            preview={{ visible: previewOpen, onVisibleChange: setPreviewOpen }}
            src={previewImage}
          />
        </Form.Item>

        <Divider titlePlacement="start">设施</Divider>

        {Object.entries(facilityFieldMap).map(([facilityKey, fieldKey]) => (
          <Form.Item key={facilityKey} name={fieldKey} label={facilityGroupLabels[facilityKey]}>
            <Checkbox.Group
              options={Object.entries(
                facilityLabelMap[facilityKey as keyof typeof facilityLabelMap]
              ).map(([value, label]) => ({ label, value }))}
            />
          </Form.Item>
        ))}

      </Form>

      {actions && <div style={{ marginTop: 24 }}>{actions}</div>}
    </>
  );
};