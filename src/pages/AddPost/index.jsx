import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";

import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../../redux/slices/auth";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import axios from "../../axios";

export const AddPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);

  const [imageUrl, setImageUrl] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const inputFileRef = useRef(null);

  const isEditing = Boolean(id);

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData();
      const file = event.target.files[0];

      function encodeImageFileAsURL(img) {
        const file = img;
        var reader = new FileReader();
        reader.onloadend = function () {
          return setImageUrl(reader.result);
        };
        return reader.readAsDataURL(file);
      }

      encodeImageFileAsURL(file);
      formData.append("image", imageUrl);
    } catch (err) {
      console.warn(err);
      console.warn("Ошибка при загрузке файла");
    }
  };

  const onClickRemoveImage = () => {
    setImageUrl("");
  };

  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const fields = {
        title,
        tags,
        imageUrl,
        text,
      };
      const { data } = isEditing
        ? await axios.patch(`/posts/${id}`, fields)
        : await axios.post("/posts", fields);
      const _id = isEditing ? id : data._id;
      navigate(`/posts/${_id}`);
    } catch (err) {
      console.warn(err);
      console.log("Ошибка при создание статьи");
    }
  };

  useEffect(() => {
    if (id) {
      axios
        .get(`/posts/${id}`)
        .then(({ data }) => {
          setTitle(data.title);
          setText(data.text);
          setImageUrl(data.imageURL);
          setTags(data.tags.join(","));
        })
        .catch((err) => {
          console.warn(err);
          console.log("Ошибка при получение статьи!");
        });
    }
  }, []);

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: "400px",
      autofocus: true,
      placeholder: "Введите текст...",
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  );

  if (!window.localStorage.getItem("token") && !isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button
        onClick={() => {
          inputFileRef.current.click();
        }}
        variant="outlined"
        size="large"
      >
        Загрузить превью
      </Button>
      <input
        ref={inputFileRef}
        type="file"
        onChange={handleChangeFile}
        hidden
      />
      {imageUrl && (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={onClickRemoveImage}
          >
            Удалить
          </Button>
          <img className={styles.image} src={`${imageUrl}`} alt="Uploaded" />
        </>
      )}
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Тэги"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        fullWidth
      />
      <SimpleMDE
        className={styles.editor}
        value={text}
        onChange={onChange}
        options={options}
      />
      <div className={styles.buttons}>
        <Button size="large" variant="contained" onClick={onSubmit}>
          {isEditing ? "Сохранить" : "Опубликовать"}
        </Button>
        <a href="/">
          <Button size="large">Отмена</Button>
        </a>
      </div>
    </Paper>
  );
};
