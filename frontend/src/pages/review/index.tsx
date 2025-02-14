import { useEffect } from "react";
import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  InputNumber,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../interfaces/IUser";
import { GetUsersById, UpdateUsersById } from "../../services/https";
import { useNavigate, Link, useParams } from "react-router-dom";

function Review() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: any }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const getUserById = async (id: string) => {
    try {
      console.log("Fetching user with ID:", id);
      const response = await GetUsersById(id);
      console.log("Full Response:", response);

      if (response) {
        console.log("Response Structure:", response);
        if (response.comment !== undefined && response.score !== undefined) {
          form.setFieldsValue({
            comment: response.comment,
            score: response.score,
          });
        } else {
          throw new Error("ข้อมูลผู้ใช้ไม่มีฟิลด์ 'comment' หรือ 'score'");
        }
      } else {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      messageApi.open({
        type: "error",
        content: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
      });
      setTimeout(() => {
        navigate(`/history/${localStorage.getItem("id")}`);
      }, 2000);
    }
  };

  const onFinish = async (values: UsersInterface) => {
    const payload = {
      ...values,
    };

    if (!id) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาด: ไม่พบ ID",
      });
      return;
    }

    try {
      await UpdateUsersById(id, payload);

      messageApi.open({
        type: "success",
        content: "บันทึกข้อมูลสำเร็จ",
      });

      setTimeout(() => {
        navigate(`/history/${localStorage.getItem("id")}`);
      }, 2000);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      });
    }
  };

  const handleDelete = async () => {
    const payload: Partial<UsersInterface> = {
      comment: "",
      score: 0,
      reply: "",
    };

    if (!id) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาด: ไม่พบ ID",
      });
      return;
    }

    try {
      await UpdateUsersById(id, payload);

      messageApi.open({
        type: "success",
        content: "ลบความคิดเห็นสำเร็จ",
      });

      setTimeout(() => {
        navigate(`/history/${localStorage.getItem("id")}`);
      }, 2000);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการลบข้อมูล",
      });
    }
  };

  useEffect(() => {
    console.log("Fetching user with ID:", id);
    if (id) {
      getUserById(id);
    }
  }, [id]);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แสดงความคิดเห็น</h2>
        <Divider />
        <Form
          name="basic"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item label="ความคิดเห็น" name="comment">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item label="คะแนน" name="score">
                <InputNumber
                  min={0}
                  max={5}
                  defaultValue={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Link to={`/history/${localStorage.getItem("id")}`}>
                    <Button htmlType="button" style={{ marginRight: "10px" }}>
                      ยกเลิก
                    </Button>
                  </Link>

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
                  >
                    บันทึก
                  </Button>

                  <Popconfirm
                    title="ยืนยันการลบ?"
                    onConfirm={handleDelete}
                    okText="ใช่"
                    cancelText="ยกเลิก"
                  >
                    <Button type="primary" danger icon={<DeleteOutlined />}>
                      ลบ
                    </Button>
                  </Popconfirm>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default Review;