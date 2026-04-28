import { Modal, List, Avatar, Rate, Tag, Button, Typography, Space } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { publicacionesService } from '../../services/publicaciones';
import { solicitudesService } from '../../services/solicitudes';
import type { Publicacion } from './PublicacionCard';

const { Text, Title } = Typography;

interface Props {
  pub: Publicacion | null;
  open: boolean;
  onClose: () => void;
}

const MatchModal = ({ pub, open, onClose }: Props) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pub && open) {
      publicacionesService.matches(pub.id)
        .then(r => setMatches(r.data))
        .catch(() => setMatches([]));
    }
  }, [pub, open]);

  const solicitar = async (matchPubId: number) => {
    setLoading(true);
    try {
      await solicitudesService.crear({ publicacion_id: matchPubId });
      Modal.success({ title: '¡Solicitud enviada!', content: 'El propietario recibirá una notificación.' });
      onClose();
    } catch (err: any) {
      Modal.error({ title: 'Error', content: err.response?.data?.error || 'No se pudo enviar la solicitud' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open} onCancel={onClose} footer={null}
      title={<Title level={5} style={{ margin: 0 }}>Matches para: {pub?.titulo}</Title>}
      width={500}
    >
      {matches.length === 0 ? (
        <Text type="secondary">No hay publicaciones compatibles en este momento.</Text>
      ) : (
        <List
          dataSource={matches}
          renderItem={(m: any, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <List.Item
                actions={[
                  <Button type="primary" size="small" loading={loading}
                    style={{ background: '#0A9BAF', border: 'none', borderRadius: 6 }}
                    onClick={() => solicitar(m.id)}>
                    Solicitar
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ background: '#0A9BAF' }} icon={<UserOutlined />} />}
                  title={<Text strong style={{ fontSize: 13 }}>{m.titulo}</Text>}
                  description={
                    <Space direction="vertical" size={2}>
                      <Text style={{ fontSize: 12 }}>{m.nombre} {m.apellido}</Text>
                      <Space size={8}>
                        <Rate disabled defaultValue={m.promedio_valoracion || 0} style={{ fontSize: 10 }} allowHalf />
                        <Tag style={{ background: '#E6F7FF', border: 'none', color: '#0A9BAF', fontSize: 11 }}>
                          <ClockCircleOutlined /> {m.creditos_hora} créditos
                        </Tag>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      )}
    </Modal>
  );
};

export default MatchModal;
