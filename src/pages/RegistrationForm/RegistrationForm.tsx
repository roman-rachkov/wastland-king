import {useForm} from "react-hook-form";
import {Player} from "../../types/Player.ts";
import {useEffect, useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {addDoc, collection, doc, getDocs, query, runTransaction, updateDoc, where} from 'firebase/firestore';
import {db} from "../../services/firebase.ts";

import {DateTime} from 'luxon';
import _ from 'lodash';
import {
  Button,
  Card,
  Col,
  Form,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  FormText,
  Image,
  ListGroup,
  Row,
  Toast,
  ToastContainer
} from "react-bootstrap";
import wak from "../../assets/images/wak.png";
import fighter from "../../assets/images/fighter.jpg";
import shooter from "../../assets/images/shooter.jpg";
import rider from "../../assets/images/rider.jpg";
import marchSize from "../../assets/images/marchSize.png";
import firstShift from "../../assets/images/1-shift.png";
import secondShift from "../../assets/images/2-shift.png";
import capitan from "../../assets/images/capitan.png";
import rallySize from "../../assets/images/rally-size.jpg";

const RegistrationForm = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: {errors}
  } = useForm<Player>({mode: 'onChange'});
// Состояния для Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
  const [existingData, setExistingData] = useState<Player | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isCaptain = watch('isCapitan');
  const nameValue = watch('name');

  // Поиск игроков с debounce
  const searchPlayers = _.debounce(async (searchText: string) => {
    if (searchText.length < 3) {
      setSearchResults([]);
      return;
    }

    const q = query(
      collection(db, 'players'),
      where('name', '>=', searchText),
      where('name', '<=', searchText + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => doc.data() as Player);
    setSearchResults(results);
    setShowSuggestions(results.length > 0);
  }, 300);

  useEffect(() => {
    if (nameValue) {
      searchPlayers(nameValue);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [nameValue]);

  // Заполнение формы при выборе игрока
  const handleSelectPlayer = (player: Player) => {
    reset(player);
    setExistingData(player);
    setShowSuggestions(false);
  };

  // Исправление для радио-кнопок
  useEffect(() => {
    if (existingData) {
      setValue('troopTier', existingData.troopTier);
      setValue('isCapitan', existingData.isCapitan);
    }
  }, [existingData, setValue]);
  // Валидация типов войск
  const validateTroopTypes = () => {
    const {troopFighter, troopShooter, troopRider} = getValues();
    return troopFighter || troopShooter || troopRider;
  };

  // Валидация смен
  const validateShifts = () => {
    const {firstShift, secondShift} = getValues();
    return firstShift || secondShift;
  };

  // Поиск существующего игрока с debounce
  const checkExistingPlayer = _.debounce(async (name: string) => {
    if (!name) return;

    const q = query(collection(db, 'players'), where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      setExistingId(doc.id);
      const playerData = doc.data() as Player;
      setExistingData(playerData);
      reset(playerData);
    } else {
      setExistingData(null);
    }
  }, 500);

  useEffect(() => {
    if (nameValue) {
      checkExistingPlayer(nameValue);
    }
  }, [nameValue]);

  // Исправленная мутация с обработкой ошибок
  const mutation = useMutation({
    mutationKey: ['players'],
    mutationFn: async (data: Player) => {
      try {
        const playerData = {
          ...data,
          createdAt: existingData?.createdAt || DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
        };

        if (existingData) {
          await updateDoc(doc(db, 'players', existingId ?? ''), playerData);
          return existingData.id;
        } else {
          const newId = await getNextPlayerId();
          await addDoc(collection(db, 'players'), { ...playerData, id: newId });
          return newId;
        }
      } catch (error) {
        throw new Error('Failed to save player: ' + error.message);
      }
    },
    onSuccess: (docId, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setToastMessage(variables.id ? '🎉 Player updated successfully!' : '✨ New player created!');
      setToastVariant('success');
      setShowToast(true);
      reset();
    },
    onError: (error) => {
      setToastMessage(`⚠️ Error: ${error.message}`);
      setToastVariant('danger');
      setShowToast(true);
    }
  });

  // Генерация ID с обработкой ошибок
  const getNextPlayerId = async () => {
    try {
      const counterRef = doc(db, 'counters', 'players');
      let newCount = 1;

      await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        newCount = (counterDoc.data()?.count || 0) + 1;
        transaction.set(counterRef, { count: newCount });
      });

      return `PLAYER-${newCount.toString().padStart(6, '0')}`;
    } catch (error) {
      throw new Error('ID generation failed: ' + error.message);
    }
  };

  const onSubmit = (data: Player) => {
    mutation.mutate(data);
  };

  return (
    <>
      <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 9999 }}>
        <Toast
          bg={toastVariant}
          show={showToast}
          onClose={() => setShowToast(false)}
          autohide
          delay={5000}
        >
          <Toast.Header className={`text-${toastVariant}`}>
            <strong className="me-auto">System Notification</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' ? 'text-white' : 'text-white'}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h2>Registration Form {existingData && '(Edit Mode)'}</h2>
            </Card.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>

              <Card.Body>
                {/* Поле имени с автодополнением */}
                <FormGroup className='mb-4'>
                  <Row>
                    <Col md={4}>
                      <FormLabel>Whats your name?</FormLabel>
                      <div className="position-relative">
                        <FormControl
                          {...register('name', {
                            required: 'Name is required'
                          })}
                          placeholder='nickname'
                          isInvalid={!!errors.name}
                          autoComplete="off"
                        />
                        {showSuggestions && (
                          <ListGroup className="position-absolute w-100" style={{zIndex: 1000}}>
                            {searchResults.map(player => (
                              <ListGroup.Item
                                key={player.id}
                                action
                                onClick={() => handleSelectPlayer(player)}
                                className="cursor-pointer"
                              >
                                {player.name} ({player.alliance})
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )}
                      </div>
                      {errors.name && (
                        <Form.Text className='text-danger'>{errors.name.message}</Form.Text>
                      )}
                    </Col>
                  </Row>
                </FormGroup>

                {/* Alliance */}
                <FormGroup className='mb-4'>
                  <Row>
                    <Col className='d-flex flex-column' md={4}>
                      <FormLabel>Alliance alias</FormLabel>
                      <Image src={wak} className='w-100 mb-2' loading='lazy'/>
                      <FormControl
                        {...register('alliance', {
                          required: 'Alliance alias is required'
                        })}
                        placeholder='ALI'
                        isInvalid={!!errors.alliance}
                      />
                      {errors.alliance && (
                        <Form.Text className='text-danger'>{errors.alliance.message}</Form.Text>
                      )}
                    </Col>
                  </Row>
                </FormGroup>

                {/* Типы войск */}
                <FormGroup>
                  <Row className='mb-4'>
                    <FormLabel>Troop type</FormLabel>
                    {['Fighter', 'Shooter', 'Rider'].map((type) => {
                        const fieldName = `troop${type}` as keyof Player;
                        return (
                          <Col key={type} className='d-flex flex-column' md={1} xs={4}>
                            <Row>
                              <Col xs={1}>
                                <FormCheck
                                  {...register(fieldName, {
                                    validate: () => validateTroopTypes() || 'Select at least one troop type'
                                  })}
                                  type='checkbox'
                                  label={type}
                                  isInvalid={!!errors[fieldName]}
                                />
                              </Col>
                            </Row>
                            <Image
                              src={type === 'Fighter' ? fighter : type === 'Shooter' ? shooter : rider}
                              className='w-100 mb-2'
                              loading='lazy'
                            />
                          </Col>
                        )
                      }
                    )}
                    {errors.troopFighter && (
                      <Form.Text className='text-danger d-block'>
                        {errors.troopFighter.message}
                      </Form.Text>
                    )}
                  </Row>
                </FormGroup>

                {/* Поле Tier с исправлением для radio */}
                <FormGroup className='mb-4'>
                  <Row>
                    <Col>
                      <FormLabel>Troop Tier</FormLabel>
                      {[10, 11, 12, 13].map((tier) => (
                        <FormCheck
                          key={tier}
                          {...register('troopTier', {
                            required: 'Troop tier is required',
                            valueAsNumber: true
                          })}
                          type='radio'
                          label={`T${tier}`}
                          value={tier}
                          isInvalid={!!errors.troopTier}
                          checked={watch('troopTier') === tier}
                        />
                      ))}
                      {errors.troopTier && (
                        <Form.Text className='text-danger'>{errors.troopTier.message}</Form.Text>
                      )}
                    </Col>
                  </Row>
                </FormGroup>
                {/* Размер отряда */}
                <FormGroup className='mb-4'>
                  <Row>
                    <Col md={4}>
                      <FormLabel>March size?</FormLabel>
                      <Image src={marchSize} className='w-100 mb-2' loading='lazy'/>
                      <FormControl
                        {...register('marchSize', {
                          required: 'March size is required',
                          valueAsNumber: true
                        })}
                        placeholder='264000'
                        type='number'
                        isInvalid={!!errors.marchSize}
                      />
                      {errors.marchSize && (
                        <Form.Text className='text-danger'>{errors.marchSize.message}</Form.Text>
                      )}
                    </Col>
                  </Row>
                </FormGroup>

                {/* Смены */}
                <FormGroup className='mb-4'>
                  <Row>
                    <FormLabel>Availability</FormLabel>
                    <FormText>Stronger players encoraged to take 1st shift</FormText>
                    {[['firstShift', firstShift], ['secondShift', secondShift]].map(([field, img]) => (
                      <Col key={field} className='d-flex flex-column' md={3} xs={6}>
                        <Row>
                          <Col>
                            <FormCheck
                              {...register(field as keyof Player, {
                                validate: () => validateShifts() || 'Select at least one shift'
                              })}
                              type='checkbox'
                              label={field === 'firstShift' ? 'First shift' : 'Second shift'}
                              isInvalid={!!errors[field]}
                            />
                          </Col>
                        </Row>
                        <Image src={img} className='w-100 mb-2' loading='lazy'/>
                      </Col>
                    ))}
                    {errors.firstShift && (
                      <Form.Text className='text-danger d-block'>
                        {errors.firstShift.message}
                      </Form.Text>
                    )}
                  </Row>
                </FormGroup>

                {/* Поле Captain с исправлением для radio */}
                <FormGroup className='mb-4'>
                  <Row className='flex-column'>
                    <FormLabel>Are you available to captain a turret?</FormLabel>
                    <Col className='d-flex mb-2' md={4}>
                      {[true, false].map((value) => (
                        <FormCheck
                          key={value.toString()}
                          {...register('isCapitan', {
                            setValueAs: (v) => v === 'true'
                          })}
                          type='radio'
                          label={value ? 'Yes' : 'No'}
                          value={value.toString()}
                          isInvalid={!!errors.isCapitan}
                          checked={watch('isCapitan') === value}
                        />
                      ))}
                    </Col>
                    <Col md={4}>
                      <Image src={capitan} className='w-100 mb-2' loading='lazy'/>

                    </Col>
                  </Row>
                </FormGroup>

                {/* Размер отряда для капитана */}
                <Row className='mb-4'>
                  <Col className='d-flex flex-column' md={4}>
                    <FormLabel>Rally Size - Correct Size</FormLabel>
                    <Image src={rallySize} className='w-100 mb-2' loading='lazy'/>
                    <FormControl
                      {...register('rallySize', {
                        validate: (value) => {
                          if (isCaptain && !value) return 'Rally size is required for captains';
                          return true;
                        },
                        valueAsNumber: true
                      })}
                      placeholder='1130000'
                      type='number'
                      isInvalid={!!errors.rallySize}
                    />
                    {errors.rallySize && (
                      <Form.Text className='text-danger'>{errors.rallySize.message}</Form.Text>
                    )}
                  </Col>
                </Row>


              </Card.Body>
              {/* Кнопка отправки */}
              <Card.Footer className='sticky-bottom'>
                <Row>
                  <Col className='d-flex'>
                    <Button
                      className='ms-auto'
                      type='submit'
                      disabled={mutation.isLoading || Object.keys(errors).length > 0}
                    >
                      {mutation.isLoading ? 'Saving...' : 'Submit'}
                    </Button>
                  </Col>
                </Row>
              </Card.Footer>
            </Form>

          </Card>
        </Col>
      </Row>

    </>
  );
};

export default RegistrationForm;