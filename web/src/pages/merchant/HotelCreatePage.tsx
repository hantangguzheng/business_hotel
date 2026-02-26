import { HotelEditForm } from "@/components/HotelEditForm";
import { useHotels } from "@/hooks/merchant";
import { App, Breadcrumb, Button, Form, Popconfirm, Space } from "antd";
import useAxios from "axios-hooks";
// import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import styles from './HotelCreatePage.module.css';
import { ArrowLeftOutlined } from "@ant-design/icons";
import { endpoint } from "@/api/endpoint";
import type { IHotelCreateRequest } from "@/api/types/hotel";

export const HotelCreatePage = () => {
    const navigate = useNavigate();
    // const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { message: msg } = App.useApp();


    const { refresh } = useHotels();
    // const hotel = getHotel(Number(id));

    const [{ loading: submitLoading }, execCreate] = useAxios<any, FormData | IHotelCreateRequest>(
        '', { manual: true }
    );
    // const [, execUpdateFromUrl] = useAxios(
    //     endpoint.updateMerchantHotelFromUrl(Number(id)), { manual: true }
    // );

    const onFinish = async (data: FormData | IHotelCreateRequest) => {
        try {
            const isFormData = data instanceof FormData;
            const curConfig = endpoint.postCreateHotel(data);
            if (isFormData) {
                await execCreate({
                    ...curConfig,
                    headers: { ...curConfig.headers, 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await execCreate({ ...curConfig });
            }
            msg.success('创建成功');
            refresh();
            navigate(`/merchant/hotels`);
        } catch (e: any) {
            msg.error(e?.message ?? '保存失败');
        }
    };

    const onBack = () => navigate(`/merchant/hotels`);

    return (
        <div className={styles.container}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[
                    { title: <a onClick={() => navigate('/merchant/hotels')}>酒店信息管理</a> },
                    { title: '新增酒店申请' },
                ]}
            />

            <HotelEditForm
                form={form}
                onFinish={onFinish}
                actions={
                    <Space>
                        <Popconfirm
                            title="是否确认放弃"
                            description="退出后未保存的修改都将丢失"
                            onConfirm={onBack}
                            okText="是"
                            cancelText="否"
                        >
                            <Button
                                icon={<ArrowLeftOutlined />}
                                // onClick={() => navigate(`/merchant/hotel/${id}`)}
                            >
                                放弃
                            </Button>
                        </Popconfirm>
                        <Button
                            type="primary"
                            loading={submitLoading}
                            onClick={() => form.submit()}
                        >
                            保存
                        </Button>
                    </Space>
                }
            />
        </div>
    );
}