import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Box,
  SimpleGrid,
  Tooltip,
  Divider,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { Plus, Pencil, Trash2, Power, PowerOff, Bell, Mail, MessageCircle } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAlertStore, getConditionLabel, getConditionUnit } from '@/store/useAlertStore';
import type { PriceAlertRule, AlertConditionType, NotificationChannel } from '@/types';

interface RuleFormData {
  name: string;
  fruitId: string;
  marketId: string | null;
  conditionType: AlertConditionType;
  threshold: number;
  enabled: boolean;
  notificationChannels: NotificationChannel[];
}

const defaultFormData: RuleFormData = {
  name: '',
  fruitId: '',
  marketId: null,
  conditionType: 'price_above',
  threshold: 0,
  enabled: true,
  notificationChannels: [
    { type: 'system', enabled: true },
    { type: 'dingtalk', enabled: false, config: { webhook: '' } },
    { type: 'email', enabled: false, config: { address: '' } },
  ],
};

function RuleEditorModal({
  isOpen,
  onClose,
  editingRule,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingRule: PriceAlertRule | null;
}) {
  const { fruits, markets } = useDataStore();
  const { addRule, updateRule } = useAlertStore();
  const [form, setForm] = useState<RuleFormData>(defaultFormData);

  useEffect(() => {
    if (editingRule) {
      setForm({
        name: editingRule.name,
        fruitId: editingRule.fruitId,
        marketId: editingRule.marketId,
        conditionType: editingRule.conditionType,
        threshold: editingRule.threshold,
        enabled: editingRule.enabled,
        notificationChannels: editingRule.notificationChannels,
      });
    } else {
      setForm(defaultFormData);
    }
  }, [editingRule, isOpen]);

  const handleSubmit = () => {
    if (!form.name || !form.fruitId || form.threshold <= 0) return;

    if (editingRule) {
      updateRule(editingRule.id, form);
    } else {
      addRule(form);
    }
    onClose();
  };

  const toggleChannel = (type: string) => {
    setForm((prev) => ({
      ...prev,
      notificationChannels: prev.notificationChannels.map((c) =>
        c.type === type ? { ...c, enabled: !c.enabled } : c
      ),
    }));
  };

  const updateChannelConfig = (type: string, key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      notificationChannels: prev.notificationChannels.map((c) =>
        c.type === type
          ? { ...c, config: { ...(c.config || {}), [key]: value } }
          : c
      ),
    }));
  };

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editingRule ? '编辑预警规则' : '新建预警规则'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">规则名称</FormLabel>
                <Input
                  placeholder="如：红富士价格超12元预警"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">水果品种</FormLabel>
                <Select
                  value={form.fruitId}
                  onChange={(e) => setForm({ ...form, fruitId: e.target.value })}
                >
                  <option value="">请选择品种</option>
                  {fruits.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">目标市场</FormLabel>
                <Select
                  value={form.marketId || ''}
                  onChange={(e) =>
                    setForm({ ...form, marketId: e.target.value || null })
                  }
                >
                  <option value="">全部市场</option>
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">预警条件</FormLabel>
                <Select
                  value={form.conditionType}
                  onChange={(e) =>
                    setForm({ ...form, conditionType: e.target.value as AlertConditionType })
                  }
                >
                  <option value="price_above">价格高于</option>
                  <option value="price_below">价格低于</option>
                  <option value="change_above">日涨幅超过</option>
                  <option value="change_below">日跌幅超过</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">
                  阈值（{getConditionUnit(form.conditionType)}）
                </FormLabel>
                <Input
                  type="number"
                  step={form.conditionType.startsWith('price') ? '0.01' : '0.1'}
                  min={0}
                  value={form.threshold}
                  onChange={(e) =>
                    setForm({ ...form, threshold: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0} fontSize="sm">启用规则</FormLabel>
                <Switch
                  isChecked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  colorScheme="brand"
                />
              </FormControl>
            </SimpleGrid>

            <Divider />

            <Box>
              <Text fontSize="sm" fontWeight={600} mb={3}>
                通知渠道
              </Text>
              <VStack spacing={3} align="stretch">
                <Card bg={cardBg} borderRadius="md">
                  <CardBody p={3}>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Bell size={18} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight={500}>系统通知</Text>
                          <Text fontSize="xs" color={subTextColor}>站内弹窗提醒</Text>
                        </VStack>
                      </HStack>
                      <Switch
                        isChecked={form.notificationChannels.find((c) => c.type === 'system')?.enabled}
                        onChange={() => toggleChannel('system')}
                        colorScheme="brand"
                      />
                    </HStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderRadius="md">
                  <CardBody p={3}>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <MessageCircle size={18} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight={500}>钉钉通知</Text>
                            <Text fontSize="xs" color={subTextColor}>发送到钉钉群机器人（占位，待接入）</Text>
                          </VStack>
                        </HStack>
                        <Switch
                          isChecked={form.notificationChannels.find((c) => c.type === 'dingtalk')?.enabled}
                          onChange={() => toggleChannel('dingtalk')}
                          colorScheme="brand"
                        />
                      </HStack>
                      {form.notificationChannels.find((c) => c.type === 'dingtalk')?.enabled && (
                        <FormControl mt={1}>
                          <FormLabel fontSize="xs" mb={1}>Webhook地址</FormLabel>
                          <Input
                            size="sm"
                            placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
                            value={form.notificationChannels.find((c) => c.type === 'dingtalk')?.config?.webhook || ''}
                            onChange={(e) => updateChannelConfig('dingtalk', 'webhook', e.target.value)}
                          />
                        </FormControl>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderRadius="md">
                  <CardBody p={3}>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Mail size={18} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight={500}>邮件通知</Text>
                            <Text fontSize="xs" color={subTextColor}>发送到指定邮箱（占位，待接入）</Text>
                          </VStack>
                        </HStack>
                        <Switch
                          isChecked={form.notificationChannels.find((c) => c.type === 'email')?.enabled}
                          onChange={() => toggleChannel('email')}
                          colorScheme="brand"
                        />
                      </HStack>
                      {form.notificationChannels.find((c) => c.type === 'email')?.enabled && (
                        <FormControl mt={1}>
                          <FormLabel fontSize="xs" mb={1}>邮箱地址</FormLabel>
                          <Input
                            size="sm"
                            placeholder="example@company.com"
                            value={form.notificationChannels.find((c) => c.type === 'email')?.config?.address || ''}
                            onChange={(e) => updateChannelConfig('email', 'address', e.target.value)}
                          />
                        </FormControl>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            取消
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit}>
            {editingRule ? '保存修改' : '创建规则'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function AlertSettingsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { rules, toggleRule, deleteRule } = useAlertStore();
  const { fruits, markets } = useDataStore();
  const { isOpen: isEditorOpen, onOpen: openEditor, onClose: closeEditor } = useDisclosure();
  const [editingRule, setEditingRule] = useState<PriceAlertRule | null>(null);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const handleEdit = (rule: PriceAlertRule) => {
    setEditingRule(rule);
    openEditor();
  };

  const handleCreate = () => {
    setEditingRule(null);
    openEditor();
  };

  const getFruitName = (id: string) => fruits.find((f) => f.id === id)?.name || id;
  const getMarketName = (id: string | null) =>
    id ? markets.find((m) => m.id === id)?.name || id : '全部市场';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="85vh">
          <ModalHeader>
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontWeight={700}>预警规则管理</Text>
                <Text fontSize="xs" color={subTextColor} fontWeight={400}>
                  配置价格预警条件，支持多渠道通知
                </Text>
              </VStack>
              <Button
                leftIcon={<Plus size={16} />}
                size="sm"
                colorScheme="brand"
                onClick={handleCreate}
              >
                新建规则
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {rules.length === 0 ? (
              <VStack py={12} spacing={3}>
                <Bell size={48} color="gray" />
                <Text color={subTextColor}>暂无预警规则</Text>
                <Button leftIcon={<Plus size={16} />} colorScheme="brand" onClick={handleCreate}>
                  创建第一条规则
                </Button>
              </VStack>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th>规则名称</Th>
                      <Th>品种</Th>
                      <Th>市场</Th>
                      <Th>条件</Th>
                      <Th>阈值</Th>
                      <Th>状态</Th>
                      <Th isNumeric>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rules.map((rule) => (
                      <Tr key={rule.id}>
                        <Td fontWeight={500}>{rule.name}</Td>
                        <Td>{getFruitName(rule.fruitId)}</Td>
                        <Td>{getMarketName(rule.marketId)}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              rule.conditionType.includes('above') ? 'red' : 'orange'
                            }
                            variant="subtle"
                          >
                            {getConditionLabel(rule.conditionType)}
                          </Badge>
                        </Td>
                        <Td>
                          {rule.threshold} {getConditionUnit(rule.conditionType)}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={rule.enabled ? 'green' : 'gray'}
                            variant="subtle"
                          >
                            {rule.enabled ? '已启用' : '已禁用'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack justify="flex-end" spacing={1}>
                            <Tooltip label={rule.enabled ? '禁用' : '启用'}>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="toggle"
                                icon={rule.enabled ? <Power size={14} /> : <PowerOff size={14} />}
                                onClick={() => toggleRule(rule.id)}
                              />
                            </Tooltip>
                            <Tooltip label="编辑">
                              <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="edit"
                                icon={<Pencil size={14} />}
                                onClick={() => handleEdit(rule)}
                              />
                            </Tooltip>
                            <Tooltip label="删除">
                              <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="delete"
                                colorScheme="red"
                                icon={<Trash2 size={14} />}
                                onClick={() => deleteRule(rule.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Text fontSize="xs" color={subTextColor}>
              共 {rules.length} 条规则 · 数据保存在本地浏览器
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <RuleEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          closeEditor();
          setEditingRule(null);
        }}
        editingRule={editingRule}
      />
    </>
  );
}
